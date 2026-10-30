import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout, tokensRefreshed } from '../Auth/authSlice';
import menuReducer from '../NavBar/navBarSlice';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import type { UserProfile } from '../interfaces/authParameters';

export const profile: UserProfile = {
    id: 1,
    email: 'jesus@example.com',
    full_name: 'Jesus Cozatl',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    timestamp: '2026-10-28T12:00:00Z',
};

type AuthPreload = Partial<ReturnType<typeof authReducer>>;

/**
 * Real store (auth + menu) wired to the api client the same way store.ts does it,
 * so tests exercise thunks, interceptors and reducers together. Network is mocked with mockApi*.
 */
export const makeStore = (auth: AuthPreload = {}) => {
    const store = configureStore({
        reducer: { auth: authReducer, menu: menuReducer },
        preloadedState: {
            auth: { ...authReducer(undefined, { type: '@@init' }), ...auth },
        },
    });
    setAccessTokenGetter(() => store.getState().auth.accessToken);
    setSessionHandlers({
        onTokensRefreshed: (access) => {
            store.dispatch(tokensRefreshed(access));
        },
        onSessionExpired: () => {
            store.dispatch(logout());
        },
    });
    return store;
};

/** State of a user that is already logged in. */
export const loggedIn = (user: UserProfile = profile): AuthPreload => ({
    user,
    accessToken: 'access-1',
    isAuthenticated: true,
    initialized: true,
});
