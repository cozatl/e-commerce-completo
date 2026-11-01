import { RootState } from "../../store/store";

// Custom selectors to skip writing all the path when needed (state => state.menu.isMenuOpen) for example
export const selectCartItems = (state: RootState) =>
    state.cart.items;

export const selectIsCartOpen = (state: RootState) =>
    state.cart.isCartOpen;

// Totals are computed by the server; the slice only keeps the last response.
export const selectTotalQty = (state: RootState) =>
    state.cart.totalQuantity;

/** Decimal string ("1250.00") straight from the API. */
export const selectTotalPrice = (state: RootState) =>
    state.cart.total;

export const selectCartHasProblems = (state: RootState) =>
    state.cart.hasProblems;

export const selectCartStatus = (state: RootState) =>
    state.cart.status;

export const selectCartError = (state: RootState) =>
    state.cart.error;

export const selectPendingItemIds = (state: RootState) =>
    state.cart.pendingItemIds;

/** true while this product is being added (use it to disable an "Add to cart" button). */
export const selectIsAddingProduct = (slug: string) => (state: RootState) =>
    state.cart.pendingProducts.includes(slug);

/** Quantity of a product already in the cart (0 if absent), e.g. to cap "Add" on a product card. */
export const selectQuantityInCart = (slug: string) => (state: RootState) =>
    state.cart.items.find((item) => item.product.slug === slug)?.quantity ?? 0;
