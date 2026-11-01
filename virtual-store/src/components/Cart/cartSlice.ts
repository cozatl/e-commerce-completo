import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { FAILED, IDLE, LOADING, SUCCEEDED } from '../../store/status';
import { api } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { logout } from '../Auth/authSlice';
import type { AddToCartPayload, Cart, CartItem, UpdateCartItemPayload } from '../interfaces/cartParameters';

/**
 * The cart lives on the server (one per user). This slice is only a copy of the last
 * response: every endpoint returns the whole cart with totals computed by Django, so
 * there is no price math here and nothing is persisted in localStorage.
 */
type CartState = {
    isCartOpen: boolean;
    cartId: number | null;
    items: CartItem[];
    totalQuantity: number;
    /** Decimal string from the API ("0.00"). */
    total: string;
    hasProblems: boolean;
    status: string;
    error: string | null;
    /** Cart rows with a request in flight (their buttons are disabled meanwhile). */
    pendingItemIds: number[];
    /** Product slugs being added (lets a product card disable its "Add" button). */
    pendingProducts: string[];
};

const initialState: CartState = {
    isCartOpen: false,
    cartId: null,
    items: [],
    totalQuantity: 0,
    total: '0.00',
    hasProblems: false,
    status: IDLE,
    error: null,
    pendingItemIds: [],
    pendingProducts: [],
};

/**
 * Only the part of the root state the thunks read. Using RootState here would make the
 * store type depend on itself (store -> cartReducer -> thunks -> RootState).
 */
type AuthSnapshot = { auth: { isAuthenticated: boolean; user: { id: number } | null } };
type ThunkConfig = { state: AuthSnapshot; rejectValue: string | null };

const LOGIN_REQUIRED = 'Please log in to use the cart.';

/**
 * Runs a cart request for the logged-in user. If the session changed while the request
 * was in flight (logout, or another user logged in) the response is dropped silently
 * (reject with null) so one user's cart never shows up for the next one.
 */
const cartRequest = async <R>(
    getState: () => AuthSnapshot,
    rejectWithValue: (value: string | null) => R,
    request: () => Promise<Cart>,
    fallback: string,
): Promise<Cart | R> => {
    const { auth } = getState();
    if (!auth.isAuthenticated || !auth.user) return rejectWithValue(LOGIN_REQUIRED);
    const userId = auth.user.id;
    try {
        const cart = await request();
        if (getState().auth.user?.id !== userId) return rejectWithValue(null);
        return cart;
    } catch (err) {
        if (getState().auth.user?.id !== userId) return rejectWithValue(null);
        return rejectWithValue(getErrorMessage(err, fallback));
    }
};

/** GET /cart/ — dispatched automatically after login, register and session restore (store.ts). */
export const fetchCart = createAsyncThunk<Cart, void, ThunkConfig>(
    'cart/fetchCart',
    (_, { getState, rejectWithValue }) =>
        cartRequest(getState, rejectWithValue, () => api.get<Cart>('/cart/'), 'Could not load your cart.')
);

/** POST /cart/items/ — adds `quantity` (default 1) units; merges with an existing row. */
export const addToCart = createAsyncThunk<Cart, AddToCartPayload, ThunkConfig>(
    'cart/addToCart',
    (payload, { getState, rejectWithValue }) =>
        cartRequest(
            getState,
            rejectWithValue,
            () => api.post<Cart>('/cart/items/', { quantity: 1, ...payload }),
            'Could not add the product to your cart.',
        )
);

/** PATCH /cart/items/<id>/ — sets the quantity of a row (use removeFromCart for 0). */
export const updateCartItem = createAsyncThunk<Cart, UpdateCartItemPayload, ThunkConfig>(
    'cart/updateCartItem',
    ({ id, quantity }, { getState, rejectWithValue }) =>
        cartRequest(
            getState,
            rejectWithValue,
            () => api.patch<Cart>(`/cart/items/${id}/`, { quantity }),
            'Could not update the quantity.',
        )
);

/** DELETE /cart/items/<id>/ */
export const removeFromCart = createAsyncThunk<Cart, number, ThunkConfig>(
    'cart/removeFromCart',
    (id, { getState, rejectWithValue }) =>
        cartRequest(
            getState,
            rejectWithValue,
            () => api.delete<Cart>(`/cart/items/${id}/`),
            'Could not remove the product.',
        )
);

/** DELETE /cart/ — empties the cart (also used by the simulated checkout until M4). */
export const clearCart = createAsyncThunk<Cart, void, ThunkConfig>(
    'cart/clearCart',
    (_, { getState, rejectWithValue }) =>
        cartRequest(getState, rejectWithValue, () => api.delete<Cart>('/cart/'), 'Could not empty your cart.')
);

const applyCart = (state: CartState, cart: Cart) => {
    state.cartId = cart.id;
    state.items = cart.items;
    state.totalQuantity = cart.total_quantity;
    state.total = cart.total;
    state.hasProblems = cart.has_problems;
};

const itemIdOf = (arg: unknown): number | null => {
    if (typeof arg === 'number') return arg;
    if (arg && typeof arg === 'object' && 'id' in arg) return (arg as { id: number }).id;
    return null;
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        toggleCart: (state) => {
            state.isCartOpen = !state.isCartOpen;
        },
        clearCartError: (state) => {
            state.error = null;
            if (state.status === FAILED) state.status = IDLE;
        },
        // Wipes the local copy only (the server cart stays). Also runs on logout.
        resetCart: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Whoever logs in next must start from an empty local copy.
            .addCase(logout, () => initialState)

            .addCase(addToCart.pending, (state, action) => {
                state.pendingProducts.push(action.meta.arg.product);
            })
            .addMatcher(isAnyOf(addToCart.fulfilled, addToCart.rejected), (state, action) => {
                state.pendingProducts = state.pendingProducts.filter((slug) => slug !== action.meta.arg.product);
            })

            .addMatcher(isAnyOf(updateCartItem.pending, removeFromCart.pending), (state, action) => {
                const id = itemIdOf(action.meta.arg);
                if (id !== null) state.pendingItemIds.push(id);
            })
            .addMatcher(
                isAnyOf(updateCartItem.fulfilled, updateCartItem.rejected, removeFromCart.fulfilled, removeFromCart.rejected),
                (state, action) => {
                    const id = itemIdOf(action.meta.arg);
                    state.pendingItemIds = state.pendingItemIds.filter((pending) => pending !== id);
                }
            )

            .addMatcher(
                isAnyOf(fetchCart.pending, addToCart.pending, updateCartItem.pending, removeFromCart.pending, clearCart.pending),
                (state) => {
                    state.status = LOADING;
                    state.error = null;
                }
            )
            .addMatcher(
                isAnyOf(
                    fetchCart.fulfilled,
                    addToCart.fulfilled,
                    updateCartItem.fulfilled,
                    removeFromCart.fulfilled,
                    clearCart.fulfilled,
                ),
                (state, action) => {
                    applyCart(state, action.payload);
                    state.status = SUCCEEDED;
                }
            )
            .addMatcher(
                isAnyOf(
                    fetchCart.rejected,
                    addToCart.rejected,
                    updateCartItem.rejected,
                    removeFromCart.rejected,
                    clearCart.rejected,
                ),
                (state, action) => {
                    // Rejected with null = response from a previous session: ignore it.
                    // (RTK sets meta.rejectedWithValue = !!payload, so it is false for null: check the payload itself.)
                    if (action.payload === null) {
                        state.status = IDLE;
                        return;
                    }
                    state.status = FAILED;
                    state.error = action.payload ?? 'Something went wrong with your cart.';
                }
            );
    },
});

export const { toggleCart, clearCartError, resetCart } = cartSlice.actions;

const { reducer: cartReducer } = cartSlice;
export default cartReducer;
