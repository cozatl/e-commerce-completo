import { createAsyncThunk, createSlice, isAnyOf, type Dispatch, type PayloadAction } from '@reduxjs/toolkit';
import { FAILED, IDLE, LOADING, SUCCEEDED } from '../../store/status';
import { api, refreshAccessToken } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from '../../lib/tokenStorage';
import type {
    LoginCredentials,
    ProfileUpdate,
    RegisterData,
    TokenPair,
    UserProfile,
} from '../interfaces/authParameters';

type AuthState = {
    user: UserProfile | null;
    /** In memory only: it is never persisted (the refresh token is, in tokenStorage). */
    accessToken: string | null;
    isAuthenticated: boolean;
    /** false until the first session restore attempt ends, so routes do not flash the login page. */
    initialized: boolean;
    status: string;
    error: string | null;
};

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    initialized: false,
    status: IDLE,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Used by the api client after a silent refresh (see store.ts).
        tokensRefreshed(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
        },
        // Local sign out (also used when the refresh token is rejected).
        logout(state) {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.initialized = true;
            state.status = IDLE;
            state.error = null;
        },
        clearAuthError(state) {
            state.error = null;
            if (state.status === FAILED) state.status = IDLE;
        },
    },
    extraReducers: (builder) => {
        // (addCase calls must come before addMatcher calls)
        builder
            .addCase(updateProfile.pending, (state) => {
                state.status = LOADING;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.status = SUCCEEDED;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.status = FAILED;
                state.error = action.payload ?? null;
            })
            // login, register and session restore all end the same way: profile loaded = authenticated
            .addMatcher(isAnyOf(loginUser.pending, registerUser.pending, restoreSession.pending), (state) => {
                state.status = LOADING;
                state.error = null;
            })
            .addMatcher(
                isAnyOf(loginUser.fulfilled, registerUser.fulfilled, restoreSession.fulfilled),
                (state, action) => {
                    state.user = action.payload;
                    state.isAuthenticated = true;
                    state.initialized = true;
                    state.status = SUCCEEDED;
                }
            )
            .addMatcher(isAnyOf(loginUser.rejected, registerUser.rejected, restoreSession.rejected), (state, action) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.initialized = true;
                state.status = FAILED;
                // A failed silent restore is not an error to show: the user just has to log in.
                state.error = restoreSession.rejected.match(action) ? null : (action.payload ?? null);
            });
    },
});

export const { tokensRefreshed, logout, clearAuthError } = authSlice.actions;

/** Stores the tokens and loads the profile: the session starts once the profile is known. */
const startSession = async (tokens: TokenPair, dispatch: Dispatch): Promise<UserProfile> => {
    setRefreshToken(tokens.refresh);
    dispatch(tokensRefreshed(tokens.access)); // the request interceptor reads it from the store
    try {
        return await api.get<UserProfile>('/profile');
    } catch (err) {
        clearRefreshToken();
        throw err;
    }
};

export const loginUser = createAsyncThunk<UserProfile, LoginCredentials, { rejectValue: string }>(
    'auth/loginUser',
    async (credentials, { dispatch, rejectWithValue }) => {
        try {
            const tokens = await api.post<TokenPair>('/token', credentials);
            return await startSession(tokens, dispatch);
        } catch (err) {
            return rejectWithValue(getErrorMessage(err, 'Could not log in. Please try again.'));
        }
    }
);

export const registerUser = createAsyncThunk<UserProfile, RegisterData, { rejectValue: string }>(
    'auth/registerUser',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            // The backend returns the tokens, so the new customer is logged in right away.
            const tokens = await api.post<TokenPair>('/register', data);
            return await startSession(tokens, dispatch);
        } catch (err) {
            return rejectWithValue(getErrorMessage(err, 'Could not create the account. Please try again.'));
        }
    }
);

/** Runs once when the app loads: turns the stored refresh token back into a session. */
export const restoreSession = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
    'auth/restoreSession',
    async (_, { dispatch, rejectWithValue }) => {
        if (!getRefreshToken()) return rejectWithValue('No stored session');
        try {
            const access = await refreshAccessToken(); // rotates the refresh token and updates the store
            dispatch(tokensRefreshed(access));
            return await api.get<UserProfile>('/profile');
        } catch (err) {
            clearRefreshToken();
            return rejectWithValue(getErrorMessage(err));
        }
    }
);

export const updateProfile = createAsyncThunk<UserProfile, ProfileUpdate, { rejectValue: string }>(
    'auth/updateProfile',
    async (changes, { rejectWithValue }) => {
        try {
            return await api.patch<UserProfile>('/profile', changes);
        } catch (err) {
            return rejectWithValue(getErrorMessage(err, 'Could not save your changes.'));
        }
    }
);

/** Signs out immediately in the UI, then blacklists the refresh token on the server. */
export const signOut = createAsyncThunk<void, void>('auth/signOut', async (_, { dispatch }) => {
    const refresh = getRefreshToken();
    clearRefreshToken();
    dispatch(logout());
    if (!refresh) return;
    try {
        await api.post('/logout', { refresh });
    } catch {
        // Already signed out locally; the token expires by itself within 30 minutes.
    }
});

// Export reducer
const { reducer: authReducer } = authSlice;
export default authReducer;
