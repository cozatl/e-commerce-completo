import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { InternalAxiosRequestConfig } from 'axios';
import Theme from '../Theme';
import CheckOut from '../Checkout';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { bodyOf, mockApiRoutes, type MockReply } from '../../lib/__test__/mockAdapter';
import { address, cartRow, emptyCartResponse, makeShopStore, order, quote } from './orderFixtures';

const renderCheckout = (store: ReturnType<typeof makeShopStore>) =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter initialEntries={['/checkout']}>
                <Provider store={store}>
                    <Routes>
                        <Route path='/checkout' element={<CheckOut />} />
                        <Route path='/orders/:orderId' element={<p>order page</p>} />
                    </Routes>
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

type RouteMocks = Record<string, (config: InternalAxiosRequestConfig) => MockReply>;

/** Answers by "METHOD url". */
const mockRoutes = (routes: RouteMocks) =>
    mockApiRoutes((config) => {
        const key = `${config.method?.toUpperCase()} ${config.url}`;
        const handler = routes[key];
        if (!handler) return { status: 404, data: { detail: `No mock for ${key}` } };
        return handler(config);
    });

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('Checkout', () => {
    it('preselects the default address, shows the server totals and places the order', async () => {
        const user = userEvent.setup();
        const calls = mockRoutes({
            'GET /addresses/': () => ({ status: 200, data: [address] }),
            'GET /checkout/quote/': () => ({ status: 200, data: quote }),
            'POST /orders/': () => ({ status: 201, data: order() }),
            'GET /cart/': () => ({ status: 200, data: emptyCartResponse }),
        });
        const store = makeShopStore([cartRow()]);
        renderCheckout(store);

        const summary = await screen.findByLabelText('Order summary');
        expect(summary).toHaveTextContent('$250.00');
        expect(summary).toHaveTextContent('Shipping (Zona 2)');
        expect(summary).toHaveTextContent('$34.48');
        expect(screen.getByRole('radio', { name: /Casa/ })).toBeChecked();

        const quoteCall = calls.find((c) => c.url === '/checkout/quote/');
        expect(quoteCall?.params).toEqual({ address: 7 });

        await user.type(screen.getByLabelText(/Notes for your order/), 'Ring twice');
        await user.click(screen.getByRole('button', { name: 'Place order' }));

        expect(await screen.findByText('order page')).toBeInTheDocument();
        const post = calls.find((c) => c.method === 'post' && c.url === '/orders/');
        expect(bodyOf(post!)).toEqual({ address: 7, notes: 'Ring twice' });
        // The cart is reloaded (the server emptied it)
        await waitFor(() => expect(store.getState().cart.totalQuantity).toBe(0));
    });

    it('asks for an address when there are physical products and none is saved', async () => {
        mockRoutes({
            'GET /addresses/': () => ({ status: 200, data: [] }),
        });
        renderCheckout(makeShopStore([cartRow()]));

        expect(await screen.findByRole('form', { name: 'New address' })).toBeInTheDocument();
        expect(screen.getByText('Choose an address to calculate shipping.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled();
    });

    it('digital-only carts can be ordered without an address', async () => {
        const user = userEvent.setup();
        const calls = mockRoutes({
            'GET /addresses/': () => ({ status: 200, data: [] }),
            'GET /checkout/quote/': () => ({
                status: 200,
                data: { ...quote, needs_shipping: false, shipping_cost: '0.00', shipping_zone_name: '', total: '200.00' },
            }),
            'POST /orders/': () => ({ status: 201, data: order({ needs_shipping: false }) }),
            'GET /cart/': () => ({ status: 200, data: emptyCartResponse }),
        });
        renderCheckout(makeShopStore([cartRow({ product_type: 'software', quantity: 1, subtotal: '200.00' })]));

        const summary = await screen.findByLabelText('Order summary');
        expect(summary).not.toHaveTextContent('Shipping');
        await user.click(screen.getByRole('button', { name: 'Place order' }));

        expect(await screen.findByText('order page')).toBeInTheDocument();
        const post = calls.find((c) => c.method === 'post' && c.url === '/orders/');
        expect(bodyOf(post!)).toEqual({ notes: '' });
    });

    it('shows the server error when the order cannot be placed', async () => {
        const user = userEvent.setup();
        mockRoutes({
            'GET /addresses/': () => ({ status: 200, data: [address] }),
            'GET /checkout/quote/': () => ({ status: 200, data: quote }),
            'POST /orders/': () => ({
                status: 400,
                data: { cart: ['Some products in your cart cannot be bought.'] },
            }),
            // After the failure the cart is reloaded: the server marks the row that changed
            'GET /cart/': () => ({
                status: 200,
                data: {
                    ...emptyCartResponse,
                    items: [cartRow({ problem: 'Only 1 units of this product are in stock.' })],
                    total_quantity: 2,
                    total: '200.00',
                    has_problems: true,
                },
            }),
        });
        renderCheckout(makeShopStore([cartRow()]));

        await screen.findByLabelText('Order summary');
        await user.click(screen.getByRole('button', { name: 'Place order' }));
        expect(await screen.findByText('Some products in your cart cannot be bought.')).toBeInTheDocument();
        expect(screen.getByText(/need attention/)).toBeInTheDocument();
    });

    it('with an empty cart there is nothing to check out', async () => {
        const calls = mockRoutes({ 'GET /addresses/': () => ({ status: 200, data: [] }) });
        renderCheckout(makeShopStore([]));
        expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
        // Let the addresses request finish inside act (no "not wrapped in act" warning)
        await waitFor(() => expect(calls).toHaveLength(1));
        await waitFor(() => expect(screen.getByText('Your cart is empty.')).toBeInTheDocument());
    });
});
