import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import Theme from '../Theme';
import Cart from '../Cart';
import cartReducer, {
    addToCart,
    clearCart,
    fetchCart,
    removeFromCart,
    toggleCart,
    updateCartItem,
} from '../Cart/cartSlice';
import authReducer, { logout } from '../Auth/authSlice';
import type { Cart as CartResponse, CartItem } from '../interfaces/cartParameters';
import type { UserProfile } from '../interfaces/authParameters';
import { selectTotalPrice, selectTotalQty } from '../Cart/cartSelectors';

// The cart only talks to the server through lib/api: mock it.
const apiMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
}));
vi.mock('../../lib/api', () => ({
    api: apiMock,
    refreshAccessToken: vi.fn(),
    setAccessTokenGetter: vi.fn(),
    setSessionHandlers: vi.fn(),
}));
vi.mock('../../lib/errors', () => ({
    getErrorMessage: (err: unknown, fallback = 'Error') =>
        err instanceof Error && err.message ? err.message : fallback,
}));

const user: UserProfile = {
    id: 7,
    email: 'buyer@example.com',
    full_name: 'Buyer',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    timestamp: '2026-01-01T00:00:00Z',
};

const physical: CartItem = {
    id: 1,
    product: { id: 10, slug: 'mouse', name: 'Mouse', image: 'mouse.png', product_type: 'physical', stock: 3 },
    quantity: 2,
    unit_price: '100.00',
    subtotal: '200.00',
    max_quantity: 3,
    problem: null,
};

const ebook: CartItem = {
    id: 2,
    product: { id: 11, slug: 'django-book', name: 'Django Book', image: null, product_type: 'ebook', stock: 0 },
    quantity: 1,
    unit_price: '50.00',
    subtotal: '50.00',
    max_quantity: 1,
    problem: null,
};

const cartWith = (items: CartItem[], overrides: Partial<CartResponse> = {}): CartResponse => ({
    id: 99,
    items,
    total_quantity: items.reduce((n, i) => n + i.quantity, 0),
    total: items.reduce((n, i) => n + Number(i.subtotal), 0).toFixed(2),
    has_problems: items.some((i) => i.problem),
    updated_at: '2026-10-29T00:00:00Z',
    ...overrides,
});

const rootReducer = combineReducers({ cart: cartReducer, auth: authReducer });
type TestState = ReturnType<typeof rootReducer>;

const makeStore = (opts: { authenticated?: boolean; cart?: CartResponse; open?: boolean } = {}) => {
    const { authenticated = true, cart, open = true } = opts;
    const base = rootReducer(undefined, { type: '@@INIT' });
    const preloadedState: TestState = {
        auth: {
            ...base.auth,
            user: authenticated ? user : null,
            isAuthenticated: authenticated,
            accessToken: authenticated ? 'token' : null,
            initialized: true,
        },
        cart: {
            ...base.cart,
            isCartOpen: open,
            ...(cart && {
                cartId: cart.id,
                items: cart.items,
                totalQuantity: cart.total_quantity,
                total: cart.total,
                hasProblems: cart.has_problems,
            }),
        },
    };
    return configureStore({ reducer: rootReducer, preloadedState });
};

const renderCart = (store: ReturnType<typeof makeStore>) =>
    render(
        <ThemeProvider theme={Theme}>
            <BrowserRouter>
                <Provider store={store}>
                    <Cart />
                </Provider>
            </BrowserRouter>
        </ThemeProvider>
    );

beforeEach(() => {
    vi.clearAllMocks();
});

describe('cartSlice thunks', () => {
    it('fetchCart stores the server cart and its totals', async () => {
        const store = makeStore();
        apiMock.get.mockResolvedValueOnce(cartWith([physical, ebook]));

        await store.dispatch(fetchCart());

        expect(apiMock.get).toHaveBeenCalledWith('/cart/');
        const state = store.getState() as TestState;
        expect(state.cart.items).toHaveLength(2);
        expect(selectTotalQty(state as never)).toBe(3);
        expect(selectTotalPrice(state as never)).toBe('250.00');
    });

    it('addToCart posts the product slug (quantity 1 by default)', async () => {
        const store = makeStore();
        apiMock.post.mockResolvedValueOnce(cartWith([physical]));

        await store.dispatch(addToCart({ product: 'mouse' }));

        expect(apiMock.post).toHaveBeenCalledWith('/cart/items/', { quantity: 1, product: 'mouse' });
        expect((store.getState() as TestState).cart.items[0].product.slug).toBe('mouse');
        expect((store.getState() as TestState).cart.pendingProducts).toEqual([]);
    });

    it('updateCartItem and removeFromCart call the item endpoint', async () => {
        const store = makeStore({ cart: cartWith([physical]) });
        apiMock.patch.mockResolvedValueOnce(cartWith([{ ...physical, quantity: 3, subtotal: '300.00' }]));
        await store.dispatch(updateCartItem({ id: 1, quantity: 3 }));
        expect(apiMock.patch).toHaveBeenCalledWith('/cart/items/1/', { quantity: 3 });
        expect((store.getState() as TestState).cart.total).toBe('300.00');

        apiMock.delete.mockResolvedValueOnce(cartWith([]));
        await store.dispatch(removeFromCart(1));
        expect(apiMock.delete).toHaveBeenCalledWith('/cart/items/1/');
        expect((store.getState() as TestState).cart.items).toEqual([]);
    });

    it('clearCart empties the server cart', async () => {
        const store = makeStore({ cart: cartWith([physical]) });
        apiMock.delete.mockResolvedValueOnce(cartWith([]));
        await store.dispatch(clearCart());
        expect(apiMock.delete).toHaveBeenCalledWith('/cart/');
        expect((store.getState() as TestState).cart.totalQuantity).toBe(0);
    });

    it('keeps the cart and stores the API error when a request is rejected', async () => {
        const store = makeStore({ cart: cartWith([physical]) });
        apiMock.patch.mockRejectedValueOnce(new Error('Only 3 units of this product are in stock.'));

        await store.dispatch(updateCartItem({ id: 1, quantity: 4 }));

        const { cart } = store.getState() as TestState;
        expect(cart.error).toBe('Only 3 units of this product are in stock.');
        expect(cart.items[0].quantity).toBe(2);
        expect(cart.pendingItemIds).toEqual([]);
    });

    it('does not call the API without a session', async () => {
        const store = makeStore({ authenticated: false });
        await store.dispatch(addToCart({ product: 'mouse' }));
        expect(apiMock.post).not.toHaveBeenCalled();
        expect((store.getState() as TestState).cart.error).toMatch(/log in/i);
    });

    it('logout wipes the local cart so the next user does not inherit it', () => {
        const store = makeStore({ cart: cartWith([physical, ebook]) });
        store.dispatch(logout());
        const { cart } = store.getState() as TestState;
        expect(cart.items).toEqual([]);
        expect(cart.totalQuantity).toBe(0);
        expect(cart.total).toBe('0.00');
    });

    it('drops a response that arrives after logout', async () => {
        const store = makeStore();
        let resolve!: (cart: CartResponse) => void;
        apiMock.get.mockReturnValueOnce(new Promise<CartResponse>((r) => { resolve = r; }));

        const pending = store.dispatch(fetchCart());
        store.dispatch(logout());
        resolve(cartWith([physical]));
        await pending;

        const { cart } = store.getState() as TestState;
        expect(cart.items).toEqual([]);
        expect(cart.error).toBeNull();
    });

    it('toggles the cart panel', () => {
        let state = cartReducer(undefined, { type: '@@INIT' });
        expect(state.isCartOpen).toBe(false);
        state = cartReducer(state, toggleCart());
        expect(state.isCartOpen).toBe(true);
    });
});

describe('Cart component', () => {
    it('reloads the cart from the server each time the drawer opens', async () => {
        const store = makeStore({ open: false });
        renderCart(store);
        expect(apiMock.get).not.toHaveBeenCalled(); // closed: nothing to load

        apiMock.get.mockResolvedValueOnce(cartWith([physical]));
        act(() => {
            store.dispatch(toggleCart());
        });
        await waitFor(() => expect(apiMock.get).toHaveBeenCalledWith('/cart/'));
        expect(await screen.findByText(physical.product.name)).toBeInTheDocument();
    });

    it('renders the server items, subtotals and total', () => {
        renderCart(makeStore({ cart: cartWith([physical, ebook]) }));
        expect(screen.getByText('Mouse')).toBeInTheDocument();
        expect(screen.getByText('Django Book')).toBeInTheDocument();
        expect(screen.getByText('$ 200.00')).toBeInTheDocument();
        expect(screen.getByText('Total (3): $ 250.00')).toBeInTheDocument();
    });

    it('asks anonymous visitors to log in instead of showing a cart', () => {
        renderCart(makeStore({ authenticated: false }));
        expect(screen.getByText(/log in to see your cart/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /buy/i })).not.toBeInTheDocument();
    });

    it('+ sends quantity + 1 and is disabled at the stock limit', async () => {
        const u = userEvent.setup();
        const store = makeStore({ cart: cartWith([physical]) });
        apiMock.patch.mockResolvedValueOnce(cartWith([{ ...physical, quantity: 3, subtotal: '300.00' }]));
        renderCart(store);

        await u.click(screen.getByRole('button', { name: '+' }));

        expect(apiMock.patch).toHaveBeenCalledWith('/cart/items/1/', { quantity: 3 });
        await waitFor(() => expect(screen.getByRole('button', { name: '+' })).toBeDisabled());
    });

    it('- at quantity 1 removes the row', async () => {
        const u = userEvent.setup();
        const store = makeStore({ cart: cartWith([{ ...physical, quantity: 1, subtotal: '100.00' }]) });
        apiMock.delete.mockResolvedValueOnce(cartWith([]));
        renderCart(store);

        await u.click(screen.getByRole('button', { name: '-' }));

        expect(apiMock.delete).toHaveBeenCalledWith('/cart/items/1/');
        expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
    });

    it('digital products have no quantity controls', () => {
        renderCart(makeStore({ cart: cartWith([ebook]) }));
        expect(screen.getByText(/1 per order/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '+' })).not.toBeInTheDocument();
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });

    it('commits the typed quantity on blur, not on every keystroke', async () => {
        const u = userEvent.setup();
        const store = makeStore({ cart: cartWith([physical]) });
        apiMock.patch.mockResolvedValueOnce(cartWith([{ ...physical, quantity: 3, subtotal: '300.00' }]));
        renderCart(store);

        const input = screen.getByRole('spinbutton', { name: /quantity of mouse/i });
        await u.clear(input);
        await u.type(input, '3');
        expect(apiMock.patch).not.toHaveBeenCalled();

        await u.tab();
        expect(apiMock.patch).toHaveBeenCalledWith('/cart/items/1/', { quantity: 3 });
    });

    it('shows the API error', async () => {
        const u = userEvent.setup();
        const store = makeStore({ cart: cartWith([{ ...physical, max_quantity: 5 }]) });
        apiMock.patch.mockRejectedValueOnce(new Error('Only 3 units of this product are in stock.'));
        renderCart(store);

        await u.click(screen.getByRole('button', { name: '+' }));

        expect(await screen.findByText(/only 3 units/i)).toBeInTheDocument();
    });

    it('trash icon deletes the row', async () => {
        const u = userEvent.setup();
        const store = makeStore({ cart: cartWith([physical]) });
        apiMock.delete.mockResolvedValueOnce(cartWith([]));
        renderCart(store);

        await u.click(screen.getByAltText('Delete item'));
        expect(apiMock.delete).toHaveBeenCalledWith('/cart/items/1/');
    });

    it('Buy is disabled when the cart is empty or has problems', () => {
        const { unmount } = renderCart(makeStore({ cart: cartWith([]) }));
        expect(screen.getByRole('button', { name: /buy/i })).toBeDisabled();
        unmount();

        renderCart(makeStore({ cart: cartWith([{ ...physical, problem: 'This product is out of stock.' }]) }));
        expect(screen.getByRole('button', { name: /buy/i })).toBeDisabled();
        expect(screen.getByText('This product is out of stock.')).toBeInTheDocument();
    });

    it('Buy is enabled with a valid cart', () => {
        renderCart(makeStore({ cart: cartWith([physical]) }));
        expect(screen.getByRole('button', { name: /buy/i })).toBeEnabled();
    });
});
