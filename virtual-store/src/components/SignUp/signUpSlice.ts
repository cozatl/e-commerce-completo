import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FAILED, IDLE, SUCCEEDED } from "../../store/status";
import { UserSignUp } from "../interfaces/signUpParameters";

type SignUpState = {
    user: UserSignUp[],
    status: string,
    errors: {}
    
}

const initialState: SignUpState = {
    user: [],
    status: IDLE,
    errors: {},
};

// npm install @reduxjs/toolkit
const signUpSlice = createSlice({
    name: 'signUpUser',
    initialState,
    // This will replace actions and then passed it to reducers
    reducers: {
        addUsers: (state, action: PayloadAction<UserSignUp>) => {
            state.user.push(action.payload);console.log('pay',action.payload);
        },
    }
});

// Export actions and reducer
export const { addUsers } = signUpSlice.actions;

const { reducer: signUpReducer } = signUpSlice;
export default signUpReducer;