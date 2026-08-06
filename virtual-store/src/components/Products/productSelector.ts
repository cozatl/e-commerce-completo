import { RootState } from "../../store/store";

export const selectProducts = (state: RootState) => 
    state.product.items;