import { RootState } from "../../store/store";

// Custom selectors to skip writing all the path when needed (state => state.menu.isMenuOpen) for example
export const selectSignUpUser = (state: RootState) => 
    state.signUp.user;
