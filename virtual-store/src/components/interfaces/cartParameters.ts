import type { ProductType } from './productParameters';

/** Product fields nested in a cart row (orders.CartProductSerializer). */
export interface CartProduct {
    id: number;
    slug: string;
    name: string;
    image: string | null;
    product_type: ProductType;
    stock: number;
}

/**
 * One row of GET /cart/ (orders.CartItemSerializer).
 * DRF sends decimals as strings ("199.00"); prices always come from the server.
 */
export interface CartItem {
    id: number;
    product: CartProduct;
    quantity: number;
    unit_price: string | null;
    subtotal: string;
    /** 1 for digital products, the stock for physical ones. */
    max_quantity: number;
    /** Set when the product changed after it was added (out of stock, deactivated...). */
    problem: string | null;
}

/** Response of every /cart/ endpoint (orders.CartSerializer). */
export interface Cart {
    id: number;
    items: CartItem[];
    total_quantity: number;
    total: string;
    has_problems: boolean;
    updated_at: string;
}

/** Body of POST /cart/items/. `product` is the product slug. */
export interface AddToCartPayload {
    product: string;
    quantity?: number;
}

/** Body of PATCH /cart/items/<id>/. */
export interface UpdateCartItemPayload {
    id: number;
    quantity: number;
}
