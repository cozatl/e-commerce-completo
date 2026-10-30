import { configureStore } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer
} from "redux-persist";
import storage from "redux-persist/lib/storage";     // npm install redux-persist (Correct way to set localStorage up in redux)
import cartReducer from "../components/Cart/cartSlice";
import menuReducer from "../components/NavBar/navBarSlice";
// import productReducer from "../components/Products/productSlice";
import authReducer, { logout, tokensRefreshed } from "../components/Auth/authSlice";
import checkoutReducer from "../components/Checkout/checkoutSlice";
import { setAccessTokenGetter, setSessionHandlers } from "../lib/api";

const cartPersistConfig = {
    key:'cart',
    storage,
    whitelist:['items'],
}

const checkoutPersistConfig = {
    key:'checkout',
    storage,
    whitelist:['isEnabledCheckout'],
}

// Configure persisted Reducer to set data in localStorage only for specific elements
const persistedCartReducer = persistReducer(
    cartPersistConfig,
    cartReducer,
)

const persistedCheckoutReducer = persistReducer(
    checkoutPersistConfig,
    checkoutReducer,
)

export const store = configureStore ({
    reducer: {
        cart: persistedCartReducer,
        menu: menuReducer,              // No need to persist MenuBar
        // product: productReducer,        // No need to persist Product, must come from backend
        // auth is NOT persisted with redux-persist: the access token only lives in memory and
        // the session is restored from the refresh token (lib/tokenStorage) when the app loads.
        auth: authReducer,
        checkout: persistedCheckoutReducer,
        // checkout: checkoutReducer,
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
    })
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
