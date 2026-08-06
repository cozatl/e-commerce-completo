import { RootState } from "../../store/store";

// Custom selectors to skip writing all the path when needed (state => state.menu.isMenuOpen) for example
export const selectCartItems = (state: RootState) => 
    state.cart.items;

export const selectIsCartOpen = (state: RootState) => 
    state.cart.isCartOpen;

export const selectTotalQty = (state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectTotalPrice = (state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);