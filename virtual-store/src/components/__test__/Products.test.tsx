import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import Theme from '../Theme';
import Products, { PAGE_SIZE } from '../Products';
import cartReducer from '../Cart/cartSlice';
import { mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { setAccessTokenGetter } from '../../lib/api';
import { makeProduct, page } from './productFixtures';
import type { Category } from '../interfaces/productParameters';
import { api } from '../../lib/api';
import type { Cart } from '../interfaces/cartParameters';
import authReducer from '../Auth/authSlice';
import type { UserProfile } from '../interfaces/authParameters';

const categories: Category[] = [
    { id: 1, name: 'Phones', slug: 'phones', parent: null, is_active: true },
    { id: 2, name: 'Cases', slug: 'cases', parent: 'phones', is_active: true },
];

type Reply = { status: number; data?: unknown };

/** /categories/ answers with the list above; /products/ uses `products`. */
const mockCatalog = (products: (params: Record<string, unknown>) => Reply) => {
    const calls = mockApiRoutes((config) =>
        config.url === '/categories/' ? { status: 200, data: categories } : products(config.params ?? {})
    );
    return () => calls.filter((c) => c.url === '/products/');
};

const testUser: UserProfile = {
    id: 1,
    email: 'buyer@example.com',
    full_name: 'Buyer',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    timestamp: '2026-01-01T00:00:00Z',
};

const makeCartStore = () => {
    const reducer = { cart: cartReducer, auth: authReducer };
    const base = authReducer(undefined, { type: '@@INIT' });
    return configureStore({
        reducer,
        preloadedState: {
            auth: {
                ...base,
                user: testUser,
                isAuthenticated: true,
                accessToken: 'token',
                initialized: true,
            },
        },
    });
};

const renderProducts = (store = makeCartStore(), route = '/store') =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter initialEntries={[route]}>
                <Provider store={store}>
                    <Products />
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

beforeEach(() => {
    setAccessTokenGetter(() => 'access-1');
});

afterEach(() => {
    setAccessTokenGetter(() => null);
});

describe('Products catalog', () => {
    afterEach(() => {
        vi.restoreAllMocks();   // undo vi.spyOn(api, 'post') so it does not leak into the next test
    });
    
    it('loads the first page from the API and moves to the next one', async () => {
        const user = userEvent.setup();
        const productCalls = mockCatalog((params) =>
            params.page === 1
                ? { status: 200, data: page([makeProduct({ id: 1, name: 'Sweater' })], 7, 'next-url') }
                : { status: 200, data: page([makeProduct({ id: 4, name: 'Jeans' })], 7, null, 'prev-url') }
        );
        renderProducts();

        expect(await screen.findByText('Sweater')).toBeInTheDocument();
        expect(productCalls()[0].params).toEqual({ page: 1, page_size: PAGE_SIZE });
        expect(screen.getByText(`Page 1 of ${Math.ceil(7 / PAGE_SIZE)}`)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'Next' }));

        expect(await screen.findByText('Jeans')).toBeInTheDocument();
        expect(productCalls()[1].params).toEqual({ page: 2, page_size: PAGE_SIZE });
        expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('adds a product to the cart by slug and keeps the server cart', async () => {
        const user = userEvent.setup();
        mockCatalog(() => ({
            status: 200,
            data: page([makeProduct({ price: '800.00', discount_price: '650.00' })], 1),
        }));
        const serverCart: Cart = {
            id: 1,
            items: [{
                id: 5,
                product: { id: 1, slug: 'sweater', name: 'Sweater', image: null, product_type: 'physical', stock: 10 },
                quantity: 1,
                unit_price: '650.00',
                subtotal: '650.00',
                max_quantity: 10,
                problem: null,
            }],
            total_quantity: 1,
            total: '650.00',
            has_problems: false,
            updated_at: '2026-10-31T00:00:00Z',
        };
        const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce(serverCart);
        const store = makeCartStore();   // must include an authenticated auth state (see below)
        renderProducts(store);

        await user.click(await screen.findByRole('button', { name: /add to cart/i }));

        expect(postSpy).toHaveBeenCalledWith('/cart/items/', { quantity: 1, product: 'sweater' });
        await waitFor(() => expect(store.getState().cart.total).toBe('650.00'));
        expect(store.getState().cart.items[0].product.slug).toBe('sweater');
    });

    it('locks subscription products and disables physical ones out of stock', async () => {
        mockCatalog(() => ({
            status: 200,
            data: page(
                [
                    makeProduct({
                        id: 1,
                        name: 'Course',
                        product_type: 'video',
                        access_type: 'subscription',
                        price: null,
                        is_physical: false,
                    }),
                    makeProduct({ id: 2, name: 'Hoodie', stock: 0, is_available: false }),
                ],
                2
            ),
        }));
        renderProducts();

        expect(await screen.findByText(/subscribers only/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Subscribe' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
        expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
        expect(screen.getByText('Video')).toBeInTheDocument(); // type badge for non-physical
    });

    it('shows the API error and offers to go back to the first page', async () => {
        mockCatalog(() => ({ status: 404, data: { detail: 'Invalid page.' } }));
        renderProducts(makeCartStore(), '/store?page=9');

        expect(await screen.findByRole('alert')).toHaveTextContent('Invalid page.');
        expect(screen.getByRole('button', { name: /first page/i })).toBeInTheDocument();
    });

    it('filters by category, starting again on page 1', async () => {
        const user = userEvent.setup();
        const productCalls = mockCatalog((params) =>
            params.category === 'cases'
                ? { status: 200, data: page([makeProduct({ id: 9, name: 'Silicone case' })], 1) }
                : { status: 200, data: page([makeProduct({ id: 1, name: 'Sweater' })], 7, 'next-url', 'prev-url') }
        );
        renderProducts(makeCartStore(), '/store?page=2');

        const select = await screen.findByLabelText('Category');
        // Subcategories are listed under their parent
        expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['All', 'Phones', '\u00A0\u00A0— Cases']);

        await user.selectOptions(select, 'cases');

        expect(await screen.findByText('Silicone case')).toBeInTheDocument();
        expect(productCalls().at(-1)?.params).toEqual({ page: 1, page_size: PAGE_SIZE, category: 'cases' });
    });

    it('says so when there are no products', async () => {
        mockCatalog(() => ({ status: 200, data: page([], 0) }));
        renderProducts();

        await waitFor(() => expect(screen.getByText(/no products available/i)).toBeInTheDocument());
    });
});
