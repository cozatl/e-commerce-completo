import { RootState } from "../../store/store";

// Custom selectors to skip writing all the path when needed (state => state.menu.isMenuOpen) for example
export const selectIsAuthenticated = (state: RootState) =>
    state.auth.isAuthenticated;

export const selectCurrentUser = (state: RootState) =>
    state.auth.user;

// false until the first session restore attempt ends (avoids flashing the login page on reload)
export const selectAuthInitialized = (state: RootState) =>
    state.auth.initialized;

export const selectAuthStatus = (state: RootState) =>
    state.auth.status;

export const selectAuthError = (state: RootState) =>
    state.auth.error;
