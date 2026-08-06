import { configureStore } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer
} from "redux-persist";
import storage from "redux-persist/lib/storage";     // npm install redux-persist (Correct way to set localStorage up in redux)
import cartReducer from "../components/Cart/cartSlice";
import menuReducer from "../components/NavBar/navBarSlice";
import productReducer from "../components/Products/productSlice";
import authReducer from "../components/Auth/authSlice";
import signUpReducer from "../components/SignUp/signUpSlice";
import checkoutReducer from "../components/Checkout/checkoutSlice";

const cartPersistConfig = {
    key:'cart',
    storage,
    whitelist:['items'],
}

const authPersistConfig = {
    key:'auth',
    storage,
    whitelist:['isAuthenticated'],
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

const persistedAuthReducer = persistReducer(
    authPersistConfig,
    authReducer,
)

const persistedCheckoutReducer = persistReducer(
    checkoutPersistConfig,
    checkoutReducer,
)

export const store = configureStore ({
    reducer: {
        cart: persistedCartReducer,
        menu: menuReducer,              // No need to persist MenuBar
        product: productReducer,        // No need to persist Product, must come from backend
        auth: persistedAuthReducer,
        signUp: signUpReducer,
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

// Export the RootState type based on the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;