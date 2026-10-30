import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../Auth';
import authReducer, { logout, restoreSession, tokensRefreshed } from '../Auth/authSlice';
import { getRefreshToken, setRefreshToken } from '../../lib/tokenStorage';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { bodyOf, mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { loggedIn, makeStore, profile } from './testStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderLogin = (store: ReturnType<typeof makeStore>, route: string | { pathname: string; state?: unknown } = '/') =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter initialEntries={[route]}>
                <Provider store={store}>
                    <LoginPage />
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
});

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('Login page', () => {
    it('logs in against the API, stores the refresh token and loads the profile', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes((config) =>
            config.url === '/token'
                ? { status: 200, data: { access: 'access-1', refresh: 'refresh-1' } }
                : { status: 200, data: profile }
        );
        const store = makeStore();
        renderLogin(store);

        await user.type(screen.getByLabelText('Email'), 'Jesus@Example.com');
        await user.type(screen.getByLabelText('Password'), 'Clave-segura-123');
        await user.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));

        // email is trimmed and lower-cased; the password goes in the body, never in the URL
        expect(calls[0].url).toBe('/token');
        expect(bodyOf(calls[0])).toEqual({ email: 'jesus@example.com', password: 'Clave-segura-123' });
        // the profile request already carries the new access token
        expect(calls[1].url).toBe('/profile');
        expect(calls[1].headers.get('Authorization')).toBe('Bearer access-1');

        expect(store.getState().auth.user).toEqual(profile);
        expect(store.getState().auth.accessToken).toBe('access-1');
        expect(getRefreshToken()).toBe('refresh-1');
        // goes to the store by default
        expect(mockNavigate).toHaveBeenCalledWith('/store', { replace: true });
    });

    it('goes back to the page the visitor was trying to open', () => {
        mockApiRoutes(() => ({ status: 200, data: {} }));
        const store = makeStore(loggedIn());
        renderLogin(store, { pathname: '/', state: { from: { pathname: '/checkout' } } });

        expect(mockNavigate).toHaveBeenCalledWith('/checkout', { replace: true });
    });

    it('shows the API error and keeps the user logged out when credentials are wrong', async () => {
        const user = userEvent.setup();
        mockApiRoutes(() => ({ status: 401, data: { detail: 'No active account found with the given credentials' } }));
        const store = makeStore();
        renderLogin(store);

        await user.type(screen.getByLabelText('Email'), 'jesus@example.com');
        await user.type(screen.getByLabelText('Password'), 'mala');
        await user.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('No active account found with the given credentials');
        expect(store.getState().auth.isAuthenticated).toBe(false);
        expect(getRefreshToken()).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not call the API with empty fields', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes(() => ({ status: 200, data: {} }));
        renderLogin(makeStore());

        await user.click(screen.getByRole('button', { name: /log in/i }));

        expect(calls).toHaveLength(0);
    });
});

describe('auth slice', () => {
    const state = (over = {}) => ({ ...authReducer(undefined, { type: '@@init' }), ...over });

    it('keeps the access token only in memory and clears everything on logout', () => {
        const logged = state({ user: profile, accessToken: 'a', isAuthenticated: true });
        const next = authReducer(logged, logout());

        expect(next.user).toBeNull();
        expect(next.accessToken).toBeNull();
        expect(next.isAuthenticated).toBe(false);
        expect(next.initialized).toBe(true);
    });

    it('stores a refreshed access token', () => {
        expect(authReducer(state(), tokensRefreshed('new')).accessToken).toBe('new');
    });

    it('restores the session from the stored refresh token', async () => {
        setRefreshToken('refresh-1');
        const calls = mockApiRoutes((config) =>
            config.url === '/token/refresh'
                ? { status: 200, data: { access: 'access-2', refresh: 'refresh-2' } }
                : { status: 200, data: profile }
        );
        const store = makeStore();

        await store.dispatch(restoreSession());

        const auth = store.getState().auth;
        expect(auth.isAuthenticated).toBe(true);
        expect(auth.initialized).toBe(true);
        expect(auth.accessToken).toBe('access-2');
        expect(getRefreshToken()).toBe('refresh-2');
        expect(calls[1].headers.get('Authorization')).toBe('Bearer access-2');
    });

    it('finishes initialization without errors when there is nothing to restore', async () => {
        const calls = mockApiRoutes(() => ({ status: 200, data: {} }));
        const store = makeStore();

        await store.dispatch(restoreSession());

        const auth = store.getState().auth;
        expect(auth.initialized).toBe(true);
        expect(auth.isAuthenticated).toBe(false);
        expect(auth.error).toBeNull();
        expect(calls).toHaveLength(0);
    });

    it('drops an expired stored session silently', async () => {
        setRefreshToken('expired');
        mockApiRoutes(() => ({ status: 401, data: { code: 'token_not_valid' } }));
        const store = makeStore();

        await store.dispatch(restoreSession());

        expect(store.getState().auth.isAuthenticated).toBe(false);
        expect(store.getState().auth.error).toBeNull();
        expect(getRefreshToken()).toBeNull();
    });
});
