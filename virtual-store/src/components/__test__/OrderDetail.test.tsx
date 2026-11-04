import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Theme from '../Theme';
import OrderDetail from '../Orders/OrderDetail';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { bodyOf, mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { emptyCartResponse, makeShopStore, order } from './orderFixtures';

const ORDER_URL = '/orders/ABC123DEF456/';

const renderOrder = () =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter initialEntries={['/orders/ABC123DEF456']}>
                <Provider store={makeShopStore()}>
                    <Routes>
                        <Route path='/orders/:orderId' element={<OrderDetail />} />
                    </Routes>
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

const fillCard = async (user: ReturnType<typeof userEvent.setup>, card: string) => {
    // Wait for the order (and its payment form) to load
    await user.type(await screen.findByLabelText('Name on card'), 'Jesus Cozatl');
    await user.type(screen.getByLabelText('Card number'), card);
    await user.type(screen.getByLabelText('CVV'), '123');
};

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('Order detail', () => {
    it('shows totals with VAT breakdown and the time left to pay', async () => {
        mockApiRoutes(() => ({ status: 200, data: order({ expires_in_seconds: 125 }) }));
        renderOrder();

        const totals = await screen.findByLabelText('Order totals');
        expect(totals).toHaveTextContent('$250.00');
        expect(totals).toHaveTextContent('VAT 16% included');
        expect(totals).toHaveTextContent('$215.52');
        expect(await screen.findByRole('timer')).toHaveTextContent('2:05');
    });

    it('keeps asking when the countdown ends but the server still says pending', async () => {
        let gets = 0;
        mockApiRoutes((config) => {
            if (config.url === '/cart/') return { status: 200, data: emptyCartResponse };
            gets += 1;
            // 1st: loads at 0 s · 2nd: arrived a moment early, still pending · 3rd: expired
            if (gets < 3) return { status: 200, data: order({ expires_in_seconds: 0 }) };
            return { status: 200, data: order({ status: 'expired', status_display: 'Expired', can_pay: false, can_cancel: false, expires_in_seconds: null }) };
        });
        renderOrder();

        expect(await screen.findByText(/went back to your cart/, {}, { timeout: 4000 })).toBeInTheDocument();
        expect(gets).toBe(3);
    });

    it('pays with the simulated card and never sends the card data', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes((config) =>
            config.method === 'post'
                ? { status: 200, data: order({ status: 'paid', status_display: 'Paid', can_pay: false, can_cancel: false, can_request_cancellation: true, expires_in_seconds: null }) }
                : { status: 200, data: order() }
        );
        renderOrder();

        await fillCard(user, '4242424242424242');
        await user.click(await screen.findByRole('button', { name: /Pay \$250.00/ }));

        expect(await screen.findByRole('status')).toHaveTextContent('Payment approved');
        expect(screen.getByText('Paid')).toBeInTheDocument();
        const pay = calls.find((c) => c.method === 'post')!;
        expect(pay.url).toBe(`${ORDER_URL}pay/`);
        expect(bodyOf(pay)).toEqual({ outcome: 'approved' });
        expect(screen.getByRole('button', { name: 'Request cancellation' })).toBeInTheDocument();
    });

    it('the declined test card shows the error and keeps the payment form', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes((config) =>
            config.method === 'post'
                ? { status: 400, data: { payment: ['Card declined (simulated).'] } }
                : { status: 200, data: order() }
        );
        renderOrder();

        await fillCard(user, '4000000000000002');
        await user.click(await screen.findByRole('button', { name: /Pay/ }));

        expect(await screen.findByText('Card declined (simulated).')).toBeInTheDocument();
        expect(bodyOf(calls.find((c) => c.method === 'post')!)).toEqual({ outcome: 'declined' });
        expect(screen.getByRole('form', { name: 'Payment' })).toBeInTheDocument();
    });

    it('a 409 (reservation expired) reloads the order and the cart', async () => {
        const user = userEvent.setup();
        let gets = 0;
        const calls = mockApiRoutes((config) => {
            if (config.method === 'post') return { status: 409, data: { detail: 'The reservation expired.', code: 'expired' } };
            if (config.url === '/cart/') return { status: 200, data: emptyCartResponse };
            gets += 1;
            return { status: 200, data: gets === 1 ? order() : order({ status: 'expired', status_display: 'Expired', can_pay: false, can_cancel: false, expires_in_seconds: null }) };
        });
        renderOrder();

        await fillCard(user, '4242424242424242');
        await user.click(await screen.findByRole('button', { name: /Pay/ }));

        expect(await screen.findByText(/went back to your cart/)).toBeInTheDocument();
        expect(screen.queryByRole('form', { name: 'Payment' })).not.toBeInTheDocument();
        await waitFor(() => expect(calls.some((c) => c.url === '/cart/')).toBe(true));
    });

    it('cancels an unpaid order after confirming', async () => {
        const user = userEvent.setup();
        const calls = mockApiRoutes((config) =>
            config.method === 'post'
                ? { status: 200, data: order({ status: 'cancelled', status_display: 'Cancelled', can_pay: false, can_cancel: false, expires_in_seconds: null }) }
                : { status: 200, data: order() }
        );
        renderOrder();

        await user.click(await screen.findByRole('button', { name: 'Cancel order' }));
        await user.type(screen.getByLabelText(/Reason/), 'Changed my mind');
        await user.click(screen.getByRole('button', { name: 'Yes, cancel the order' }));

        expect(await screen.findByRole('status')).toHaveTextContent('The order was cancelled.');
        const cancel = calls.find((c) => c.method === 'post')!;
        expect(cancel.url).toBe(`${ORDER_URL}cancel/`);
        expect(bodyOf(cancel)).toEqual({ reason: 'Changed my mind' });
    });

    it('shows a pending cancellation request', async () => {
        mockApiRoutes(() => ({
            status: 200,
            data: order({ status: 'paid', status_display: 'Paid', can_pay: false, can_cancel: false, cancel_requested_at: '2026-11-03T19:00:00Z', expires_in_seconds: null }),
        }));
        renderOrder();
        expect(await screen.findByText(/Our team is reviewing it/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('unknown orders answer "not found"', async () => {
        mockApiRoutes(() => ({ status: 404, data: { detail: 'No Order matches the given query.' } }));
        renderOrder();
        expect(await screen.findByText('Order not found.')).toBeInTheDocument();
    });
});
