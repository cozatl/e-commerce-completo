import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IDLE, SUCCEEDED } from "../../store/status";
import { CartItem } from "../interfaces/cartParameters";

type CartElements = {
    isCartOpen: boolean,
    items: CartItem[],
    status: string,
    errors: {}
    
}

const initialState: CartElements = {
    isCartOpen: false,
    items: [],
    status: IDLE,
    errors: {},
};

// npm install @reduxjs/toolkit
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    // This will replace actions and then passed it to reducers
    reducers: {
        toggleCart: (state) => {
            // Review if cart is opened/closed
            state.isCartOpen = !state.isCartOpen

            state.status = SUCCEEDED;
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            // Review if cart is opened/closed
            const item = state.items.find(
                item => item.id === action.payload.id
            );
            if (item) {
                item.quantity++;
            } else {
                state.items.push({
                    ...action.payload,
                    quantity:1,
                });
            }
        },
        incrementQty: (state, action: PayloadAction<number>) => {
            const item = state.items.find((item) => item.id === action.payload);
            if (item) {
                item.quantity += 1;
            }
        },
        setQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
            const { id, quantity } = action.payload;
            const index = state.items.findIndex((i) => i.id === id);
            
            if (index !== -1) {
                if (quantity <= 0) {
                    // Remove item if user inputs 0 or a negative number
                    state.items.splice(index, 1);
                } else {
                    state.items[index].quantity = quantity;
                }
            }
        },
        decrementQty: (state, action: PayloadAction<number>) => {
            const item = state.items.find((item) => item.id === action.payload);
            
            if (item) {
                const index = state.items.findIndex((i) => i.id === item.id);
                if (index !== -1) {
                    if (item.quantity <= 1) {
                        // Remove item if user inputs 0 or a negative number
                        state.items.splice(index, 1);
                    }
                    else {
                        item.quantity -= 1;
                    }
                }
            }
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            const item = state.items.find((item) => item.id === action.payload);
            if (item) {
                const index = state.items.findIndex((i) => i.id === item.id);
                if (index !== -1) {
                    // Remove item with trash icon
                    state.items.splice(index, 1);
                }
            }
        },
        clearCart: (state) => {
            state.items = [];
        }
    },
});

// Export actions and reducer
export const { toggleCart, addToCart, incrementQty, decrementQty, setQuantity, removeFromCart, clearCart } = cartSlice.actions;

const { reducer: cartReducer } = cartSlice;
export default cartReducer;
