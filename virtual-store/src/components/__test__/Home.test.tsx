import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Theme from '../Theme';
import Home from '../Home';
import { mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { loggedIn, makeStore } from './testStore';
import type { ProductPreview } from '../interfaces/productParameters';

const preview: ProductPreview[] = [
    {
        id: 1,
        name: 'Sweater',
        slug: 'sweater',
        image: null,
        category: null,
        product_type: 'physical',
        access_type: 'purchase',
        price: '800.00',
        discount_price: null,
    },
    {
        id: 2,
        name: 'Python course',
        slug: 'python-course',
        image: null,
        category: null,
        product_type: 'video',
        access_type: 'subscription',
        price: null,
        discount_price: null,
    },
];

const renderHome = (store: ReturnType<typeof makeStore>) =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter initialEntries={['/']}>
                <Provider store={store}>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/store' element={<p>store page</p>} />
                    </Routes>
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('Home page (public preview)', () => {
    it('shows the featured products to visitors with links to log in or subscribe', async () => {
        const calls = mockApiRoutes(() => ({ status: 200, data: preview }));
        renderHome(makeStore({ initialized: true }));

        expect(await screen.findByText('Sweater')).toBeInTheDocument();
        expect(calls[0].url).toBe('/products/preview/');
        expect(screen.getByText('$ 800.00')).toBeInTheDocument();
        // Purchasable product: log in to buy. Subscription product: locked, subscribe.
        expect(screen.getByRole('link', { name: /log in to buy/i })).toHaveAttribute('href', '/login');
        expect(screen.getByText(/subscribers only/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Subscribe' })).toHaveAttribute('href', '/sign-up');
        expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
    });

    it('sends customers with a session to the full catalog', () => {
        mockApiRoutes(() => ({ status: 200, data: preview }));
        renderHome(makeStore(loggedIn()));

        expect(screen.getByText('store page')).toBeInTheDocument();
    });

    it('shows an error if the preview cannot be loaded', async () => {
        mockApiRoutes(() => ({ status: 503, data: null }));
        renderHome(makeStore({ initialized: true }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
    });
});
