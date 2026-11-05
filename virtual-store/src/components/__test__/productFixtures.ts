import type { Product } from '../interfaces/productParameters';

/** Full product as GET /products/ returns it; override what each test needs. */
export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 1,
    name: 'Sweater',
    slug: 'sweater',
    image: null,
    category: null,
    product_type: 'physical',
    access_type: 'purchase',
    price: '800.00',
    discount_price: null,
    description: 'Warm sweater',
    sku: 'sku-1',
    stock: 5,
    weight: null,
    is_active: true,
    is_featured: false,
    is_physical: true,
    is_available: true,
    created_at: '2026-10-28T12:00:00Z',
    updated_at: '2026-10-28T12:00:00Z',
    ...overrides,
});

export const page = (results: Product[], count: number, next: string | null = null, previous: string | null = null) => ({
    count,
    next,
    previous,
    results,
});
