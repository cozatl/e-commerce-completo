import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FAILED, IDLE, SUCCEEDED } from "../../store/status";

type CheckoutElements = {
    isEnabledCheckout: boolean,
    purchaseComplete: boolean,
    status: string,
    errors: {}    
}

const initialState: CheckoutElements = {
    isEnabledCheckout: false,
    purchaseComplete: false,
    status: IDLE,
    errors: {}
};

// npm install @reduxjs/toolkit
const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    // This will replace actions and then passed it to reducers
    reducers: {
        setCheckout: (state, action: PayloadAction<boolean>) => {
            // Review if cart is opened/closed
            state.isEnabledCheckout = action.payload;
        },
        setComplete: (state, action: PayloadAction<boolean>) => {
            // Review if cart is opened/closed
            state.purchaseComplete = action.payload;
        },
    },
});

// Export actions and reducer
export const { setCheckout, setComplete } = checkoutSlice.actions;

const { reducer: checkoutReducer } = checkoutSlice;
export default checkoutReducer;