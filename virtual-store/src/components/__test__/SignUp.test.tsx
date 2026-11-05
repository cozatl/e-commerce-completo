import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { MemoryRouter } from 'react-router-dom';
import SignUpPage from '../SignUp';
import { getRefreshToken } from '../../lib/tokenStorage';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { bodyOf, mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { makeStore, profile } from './testStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderSignUp = (store: ReturnType<typeof makeStore>) =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter>
                <Provider store={store}>
                    <SignUpPage />
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

const fill = async (user: ReturnType<typeof userEvent.setup>, password = 'Clave-segura-123', confirm = password) => {
    await user.type(screen.getByLabelText('Full name'), 'Jesus Cozatl');
    await user.type(screen.getByLabelText('Email'), 'Jesus@Example.com');
    await user.type(screen.getByLabelText('Password'), password);
    await user.type(screen.getByLabelText('Confirm password'), confirm);
};

beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
});

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('SignUp page', () => {
    it('registers through the API with only email, full name and password, and logs the customer in', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes((config) =>
            config.url === '/register'
                ? { status: 201, data: { access: 'access-1', refresh: 'refresh-1' } }
                : { status: 200, data: profile }
        );
        const store = makeStore();
        renderSignUp(store);

        await fill(user);
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));

        expect(calls[0].url).toBe('/register');
        // confirmPassword is a UI-only field and nothing privileged is ever sent
        expect(bodyOf(calls[0])).toEqual({
            full_name: 'Jesus Cozatl',
            email: 'jesus@example.com',
            password: 'Clave-segura-123',
        });
        expect(getRefreshToken()).toBe('refresh-1');
        expect(mockNavigate).toHaveBeenCalledWith('/store', { replace: true });
    });

    it('shows a message and sends nothing if the passwords do not match', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes(() => ({ status: 201, data: {} }));
        renderSignUp(makeStore());

        await fill(user, 'Clave-segura-123', 'otra-cosa');
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match!');
        expect(calls).toHaveLength(0);
    });

    it('shows the validation errors returned by the API (duplicate email)', async () => {
        const user = userEvent.setup();
        mockApiRoutes(() => ({ status: 400, data: { email: ['A user with this email already exists.'] } }));
        const store = makeStore();
        renderSignUp(store);

        await fill(user);
        await user.click(screen.getByRole('button', { name: /sign up/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('A user with this email already exists.');
        expect(store.getState().auth.isAuthenticated).toBe(false);
        expect(getRefreshToken()).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
