import { RootState } from "../../store/store";

// Custom selectors to skip writing all the path when needed (state => state.menu.isMenuOpen) for example

export const selectIsEnabledCheckout = (state: RootState) => 
    state.checkout.isEnabledCheckout;

export const selectPurchaseComplete = (state: RootState) => 
    state.checkout.purchaseComplete;