/** Mirrors products.choices.ProductType in Django. */
export type ProductType = 'physical' | 'software' | 'ebook' | 'video';

/** Mirrors products.choices.AccessType in Django. */
export type AccessType = 'purchase' | 'subscription' | 'free';

/** GET /categories/ (CategorySerializer). parent is the parent's slug, null at top level. */
export interface Category {
    id: number;
    name: string;
    slug: string;
    parent: string | null;
    is_active: boolean;
}

/** Category nested inside a product. */
export interface CategoryBrief {
    id: number;
    name: string;
    slug: string;
}

/**
 * Public card returned by GET /products/preview/ (ProductPreviewSerializer).
 * DRF sends decimals as strings ("199.00"); null for subscription/free products.
 */
export interface ProductPreview {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    category: CategoryBrief | null;
    product_type: ProductType;
    access_type: AccessType;
    price: string | null;
    discount_price: string | null;
}

/** Full product returned by GET /products/ and /products/<slug>/ (ProductSerializer). */
export interface Product extends ProductPreview {
    description: string;
    sku: string;
    stock: number;
    weight: string | null;
    is_active: boolean;
    is_featured: boolean;
    is_physical: boolean;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}
