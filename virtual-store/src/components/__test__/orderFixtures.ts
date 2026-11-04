import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer, { logout, tokensRefreshed } from '../Auth/authSlice';
import cartReducer from '../Cart/cartSlice';
import menuReducer from '../NavBar/navBarSlice';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import type { Address } from '../interfaces/addressParameters';
import type { CartItem } from '../interfaces/cartParameters';
import type { CheckoutQuote, Order } from '../interfaces/orderParameters';
import { loggedIn } from './testStore';

export const address: Address = {
    id: 7,
    label: 'Casa',
    recipient_name: 'Jesus Cozatl',
    phone: '5512345678',
    street: 'Av. Juárez',
    exterior_number: '10',
    interior_number: '',
    neighborhood: 'Centro',
    postal_code: '02000',
    municipality: 'Cuauhtémoc',
    city: 'Ciudad de México',
    state: 'CMX',
    state_display: 'Ciudad de México',
    references: '',
    is_default: true,
    created_at: '2026-11-03T12:00:00Z',
    updated_at: '2026-11-03T12:00:00Z',
};

export const cartRow = (overrides: Partial<CartItem> & { product_type?: CartItem['product']['product_type'] } = {}): CartItem => {
    const { product_type = 'physical', ...rest } = overrides;
    return {
        id: 1,
        product: { id: 1, slug: 'shirt', name: 'Shirt', image: null, product_type, stock: 5 },
        quantity: 2,
        unit_price: '100.00',
        subtotal: '200.00',
        max_quantity: product_type === 'physical' ? 5 : 1,
        problem: null,
        ...rest,
    };
};

export const quote: CheckoutQuote = {
    items_subtotal: '200.00',
    needs_shipping: true,
    shipping_cost: '50.00',
    shipping_zone_name: 'Zona 2',
    free_shipping_applied: false,
    total: '250.00',
    tax_rate: '0.1600',
    tax_amount: '34.48',
    reservation_minutes: 10,
};

export const order = (overrides: Partial<Order> = {}): Order => ({
    order_id: 'ABC123DEF456',
    status: 'pending_payment',
    status_display: 'Pending payment',
    currency: 'MXN',
    items: [
        {
            id: 1,
            product_slug: 'shirt',
            product_name: 'Shirt',
            sku: 'SKU-1',
            product_type: 'physical',
            unit_price: '100.00',
            quantity: 2,
            subtotal: '200.00',
        },
    ],
    items_subtotal: '200.00',
    shipping_cost: '50.00',
    total: '250.00',
    tax_rate: '0.1600',
    tax_amount: '34.48',
    subtotal_before_tax: '215.52',
    needs_shipping: true,
    shipping_zone_name: 'Zona 2',
    free_shipping_applied: false,
    shipping_address: { ...address, state_display: 'Ciudad de México' },
    tracking_number: '',
    notes: '',
    payments: [],
    created_at: '2026-11-03T18:00:00Z',
    expires_at: '2026-11-03T18:10:00Z',
    expires_in_seconds: 600,
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    cancel_requested_at: null,
    can_pay: true,
    can_cancel: true,
    can_request_cancellation: false,
    ...overrides,
});

/** Logged-in store with auth + cart + menu, wired to the api client like store.ts. */
export const makeShopStore = (items: CartItem[] = []) => {
    const cartState = cartReducer(undefined, { type: '@@init' });
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + Number(i.subtotal), 0).toFixed(2);
    const store = configureStore({
        reducer: combineReducers({ auth: authReducer, cart: cartReducer, menu: menuReducer }),
        preloadedState: {
            auth: { ...authReducer(undefined, { type: '@@init' }), ...loggedIn() },
            cart: { ...cartState, items, totalQuantity, total, hasProblems: items.some((i) => !!i.problem) },
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

export const emptyCartResponse = {
    id: 1,
    items: [],
    total_quantity: 0,
    total: '0.00',
    has_problems: false,
    updated_at: '2026-11-03T18:00:00Z',
};
