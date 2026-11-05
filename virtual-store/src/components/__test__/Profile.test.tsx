import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../Profile';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { bodyOf, mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { loggedIn, makeStore, profile } from './testStore';

const renderProfile = (store: ReturnType<typeof makeStore>) =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter>
                <Provider store={store}>
                    <ProfilePage />
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('Profile page', () => {
    it('shows the account data with a read-only email', () => {
        renderProfile(makeStore(loggedIn()));

        expect(screen.getByLabelText('Email')).toHaveValue('jesus@example.com');
        expect(screen.getByLabelText('Email')).toBeDisabled();
        expect(screen.getByLabelText('Full name')).toHaveValue('Jesus Cozatl');
    });

    it('saves the full name with PATCH /profile and sends no privileged fields', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes(() => ({ status: 200, data: { ...profile, full_name: 'Jesus C.' } }));
        const store = makeStore(loggedIn());
        renderProfile(store);

        await user.clear(screen.getByLabelText('Full name'));
        await user.type(screen.getByLabelText('Full name'), 'Jesus C.');
        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(await screen.findByRole('status')).toHaveTextContent('Changes saved.');
        expect(calls[0].method).toBe('patch');
        expect(calls[0].url).toBe('/profile');
        expect(bodyOf(calls[0])).toEqual({ full_name: 'Jesus C.' });
        expect(store.getState().auth.user?.full_name).toBe('Jesus C.');
    });

    it('requires the current password to change the password', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes(() => ({ status: 200, data: profile }));
        renderProfile(makeStore(loggedIn()));

        await user.type(screen.getByLabelText('New password'), 'Nueva-clave-456');
        await user.type(screen.getByLabelText('Confirm new password'), 'Nueva-clave-456');
        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/current password/i);
        expect(calls).toHaveLength(0);
    });

    it('sends current and new password together and shows the API error if the current one is wrong', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes(() => ({ status: 400, data: { current_password: ['Current password is incorrect.'] } }));
        renderProfile(makeStore(loggedIn()));

        await user.type(screen.getByLabelText('Current password'), 'equivocada');
        await user.type(screen.getByLabelText('New password'), 'Nueva-clave-456');
        await user.type(screen.getByLabelText('Confirm new password'), 'Nueva-clave-456');
        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect.');
        expect(bodyOf(calls[0])).toEqual({
            full_name: 'Jesus Cozatl',
            password: 'Nueva-clave-456',
            current_password: 'equivocada',
        });
    });
});
