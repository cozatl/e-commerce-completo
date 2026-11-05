import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import menuReducer, { toggleMenu } from '../NavBar/navBarSlice';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { IDLE } from '../../store/status';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../NavBar';
import { getRefreshToken, setRefreshToken } from '../../lib/tokenStorage';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { bodyOf, mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { loggedIn, makeStore } from './testStore';

const initialMenuState = {
    isMenuOpen: false,
    // history: [],
    status: IDLE,
    errors: {},
};

const renderNavbar = (store: ReturnType<typeof makeStore>) =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter>
                <Provider store={store}>
                    <Navbar />
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('NavBar Component', () => {
    it('toggles the menu state', () => {
        const nextState = menuReducer(initialMenuState, toggleMenu());

        expect(nextState.isMenuOpen).toBe(true);
    });

    it('signs out: clears the session at once and blacklists the refresh token on the server', async () => {
        const user = userEvent.setup();
        setRefreshToken('refresh-1');
        const calls = mockApiRoutes(() => ({ status: 205 }));
        const store = makeStore(loggedIn());
        renderNavbar(store);

        const signOutLink = screen.getByRole('link', { name: /Sign Out/i });
        // Home and Profile are for logged in users; Sign up is not
        expect(screen.getByRole('link', { name: /Profile/i })).toHaveAttribute('href', '/profile');
        expect(screen.queryByRole('link', { name: /Sign up/i })).not.toBeInTheDocument();

        await user.click(signOutLink);

        expect(store.getState().menu.isMenuOpen).toBe(true); // toggleMenu was dispatched
        expect(store.getState().auth.isAuthenticated).toBe(false);
        expect(store.getState().auth.accessToken).toBeNull();
        expect(getRefreshToken()).toBeNull();

        await waitFor(() => expect(calls).toHaveLength(1));
        expect(calls[0].url).toBe('/logout');
        expect(bodyOf(calls[0])).toEqual({ refresh: 'refresh-1' });
    });

    it('still signs out locally if the server cannot be reached', async () => {
        const user = userEvent.setup();
        setRefreshToken('refresh-1');
        mockApiRoutes(() => ({ status: 503 }));
        const store = makeStore(loggedIn());
        renderNavbar(store);

        await user.click(screen.getByRole('link', { name: /Sign Out/i }));

        await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(false));
        expect(getRefreshToken()).toBeNull();
    });

    it('shows Sign In and Sign up (and no Profile) to visitors', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes(() => ({ status: 200 }));
        const store = makeStore();
        renderNavbar(store);

        const signInLink = screen.getByRole('link', { name: /Sign In/i });
        expect(signInLink).toHaveAttribute('href', '/login');
        expect(screen.getByRole('link', { name: /Sign up/i })).toHaveAttribute('href', '/sign-up');
        expect(screen.queryByRole('link', { name: /Profile/i })).not.toBeInTheDocument();

        await user.click(signInLink);

        expect(store.getState().menu.isMenuOpen).toBe(true);
        expect(calls).toHaveLength(0); // nothing to sign out of
    });

    it('closes the menu when clicking Home', async () => {
        const user = userEvent.setup();
        const store = makeStore(loggedIn());
        renderNavbar(store);

        await user.click(screen.getByRole('link', { name: /Home/i }));

        expect(store.getState().menu.isMenuOpen).toBe(true);
        expect(store.getState().auth.isAuthenticated).toBe(true);
    });
});
