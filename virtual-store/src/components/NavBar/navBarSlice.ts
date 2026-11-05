import { createSlice } from "@reduxjs/toolkit";
import { IDLE, SUCCEEDED } from "../../store/status";


const initialState = {
    isMenuOpen: false,
    // history: [],
    status: IDLE,
    errors: {},
};

// npm install @reduxjs/toolkit
const menuSlice = createSlice({
    name: 'cart',
    initialState,
    // This will replace actions and then passed it to reducers
    reducers: {
        toggleMenu: (state) => {
            
            // Review if cart is opened/closed
            state.isMenuOpen = !state.isMenuOpen

            state.status = SUCCEEDED;            
        },        
    },
});

// Export actions and reducer
export const { toggleMenu } = menuSlice.actions;

const { reducer: menuReducer } = menuSlice;
export default menuReducer;
