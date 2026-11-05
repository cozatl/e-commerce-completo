import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import cartReducer, { fetchCart } from "../components/Cart/cartSlice";
import menuReducer from "../components/NavBar/navBarSlice";
// import productReducer from "../components/Products/productSlice";
import authReducer, { loginUser, logout, registerUser, restoreSession, tokensRefreshed } from "../components/Auth/authSlice";
import { setAccessTokenGetter, setSessionHandlers } from "../lib/api";

// The cart is NOT persisted: it lives on the server (one per user) and is loaded after
// login, register and session restore. Persisting it leaked one user's cart to the next.
// Remove the copy that older versions left in localStorage.
// M4: the simulated checkout state (persist:checkout) is gone too; orders live on the server.
try {
    localStorage.removeItem('persist:cart');
    localStorage.removeItem('persist:checkout');
} catch {
    // localStorage unavailable (private mode, SSR, tests): nothing to clean
}

// Load the user's cart as soon as a session starts (logout resets it inside cartSlice).
const sessionListener = createListenerMiddleware();
sessionListener.startListening({
    matcher: isAnyOf(loginUser.fulfilled, registerUser.fulfilled, restoreSession.fulfilled),
    effect: (_action, listenerApi) => {
        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(fetchCart());
    },
});

export const store = configureStore ({
    reducer: {
        cart: cartReducer,              // Not persisted: comes from GET /cart/
        menu: menuReducer,              // No need to persist MenuBar
        // product: productReducer,        // No need to persist Product, must come from backend
        // auth is NOT persisted with redux-persist: the access token only lives in memory and
        // the session is restored from the refresh token (lib/tokenStorage) when the app loads.
        auth: authReducer,
    },

// Skip errors for redux localStorage
middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [
                'persist/PERSIST',
                'persist/REHYDRATE',
                'persist/PAUSE',
                'persist/FLUSH',
                'persist/PURGE',
                'persist/REGISTER',
            ],
        },
    }).prepend(sessionListener.middleware)
})

// Connect the api client (lib/api.ts) with the store without importing Redux there
setAccessTokenGetter(() => store.getState().auth.accessToken);
setSessionHandlers({
    onTokensRefreshed: (access) => {
        store.dispatch(tokensRefreshed(access));
    },
    // The refresh token was rejected (expired, blacklisted...): back to the login page
    onSessionExpired: () => {
        store.dispatch(logout());
    },
});

// Export the RootState type based on the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;
