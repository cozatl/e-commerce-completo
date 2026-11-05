import type { ProductType } from './productParameters';

/** Mirrors orders.choices.OrderStatus in Django. */
export type OrderStatus =
    | 'pending_payment'
    | 'paid'
    | 'shipped'
    | 'delivered'
    | 'expired'
    | 'cancelled'
    | 'refunded';

/** GET /checkout/quote/ — totals of the cart before placing the order (VAT included). */
export interface CheckoutQuote {
    items_subtotal: string;
    needs_shipping: boolean;
    shipping_cost: string;
    shipping_zone_name: string;
    free_shipping_applied: boolean;
    total: string;
    /** "0.1600" */
    tax_rate: string;
    /** VAT contained in total */
    tax_amount: string;
    reservation_minutes: number;
}

/** Frozen copy of a cart row (orders.OrderItemSerializer). */
export interface OrderItem {
    id: number;
    /** null if the product was deleted later */
    product_slug: string | null;
    product_name: string;
    sku: string;
    product_type: ProductType;
    unit_price: string;
    quantity: number;
    subtotal: string;
}

export interface OrderPayment {
    reference: string;
    provider: string;
    status: 'pending' | 'approved' | 'declined' | 'refunded';
    amount: string;
    failure_reason: string;
    created_at: string;
}

/** Copy of the address the order ships to. */
export interface OrderAddress {
    recipient_name: string;
    phone: string;
    street: string;
    exterior_number: string;
    interior_number: string;
    neighborhood: string;
    postal_code: string;
    municipality: string;
    city: string;
    state: string;
    state_display: string;
    references: string;
}

/** GET /orders/<order_id>/ and the responses of POST /orders/, /pay/ and /cancel/. */
export interface Order {
    order_id: string;
    status: OrderStatus;
    status_display: string;
    currency: string;
    items: OrderItem[];
    items_subtotal: string;
    shipping_cost: string;
    total: string;
    tax_rate: string;
    tax_amount: string;
    subtotal_before_tax: string;
    needs_shipping: boolean;
    shipping_zone_name: string;
    free_shipping_applied: boolean;
    shipping_address: OrderAddress | null;
    tracking_number: string;
    notes: string;
    payments: OrderPayment[];
    created_at: string;
    expires_at: string | null;
    /** Seconds left to pay (null when it is not pending). */
    expires_in_seconds: number | null;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    cancel_requested_at: string | null;
    can_pay: boolean;
    /** Unpaid: the customer cancels right away. */
    can_cancel: boolean;
    /** Paid: the customer asks and staff decides. */
    can_request_cancellation: boolean;
}

/** One row of GET /orders/ (orders.OrderListSerializer). */
export interface OrderListItem {
    order_id: string;
    status: OrderStatus;
    status_display: string;
    total: string;
    currency: string;
    item_count: number;
    created_at: string;
    expires_in_seconds: number | null;
    can_pay: boolean;
    cancel_requested_at: string | null;
}

/** Body of POST /orders/. */
export interface CreateOrderPayload {
    address?: number | null;
    notes?: string;
}

export type PaymentOutcome = 'approved' | 'declined';
