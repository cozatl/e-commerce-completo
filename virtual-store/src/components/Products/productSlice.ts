import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FAILED, IDLE, SUCCEEDED } from "../../store/status";
import { ProductItem } from "../interfaces/productParameters";

type ProductElements = {
    items: ProductItem[],
    status: string,
    errors: {}
    
}

const initialState: ProductElements = {
    items: [],
    status: IDLE,
    errors: {},
};

// npm install @reduxjs/toolkit
const productSlice = createSlice({
    name: 'products',
    initialState,
    // This will replace actions and then passed it to reducers
    reducers: {
        addProducts: (state, action: PayloadAction<ProductItem[]>) => {
            action.payload.forEach(newProduct => {
                // Opcional: Evita duplicados si el producto ya existe en el catálogo
                const exists = state.items.some(p => p.id === newProduct.id);
                if (!exists) {
                    state.items.push(newProduct);
                }
            });
        },
    }
});

// Export actions and reducer
export const { addProducts } = productSlice.actions;

const { reducer: productReducer } = productSlice;
export default productReducer;