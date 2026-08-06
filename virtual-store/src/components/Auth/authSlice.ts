import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { FAILED, IDLE, SUCCEEDED } from "../../store/status";
import { UserLogin } from "../interfaces/authParameters";


// export const login = createAsyncThunk('tasks/fetchTasks', async () => {
//     const response = await axios.get('backend-url'); // Get data from API URL
//     return response.data
// });

type AuthState = {
    currentUser: UserLogin | null;
    // status: string,
    isAuthenticated: boolean;
    errors: {};
    
}

const initialState: AuthState = {
    currentUser: null,
    // status: IDLE,
    isAuthenticated: false,
    errors: {},
};

// npm install @reduxjs/toolkit
const authSlice = createSlice({
    name: 'auth',
    initialState,
    // This will replace actions and then passed it to reducers
    reducers: {
        // addUsers: (state, action: PayloadAction<UserLogin[]>) => {
        //     action.payload.forEach(newUser => {
        //         // Opcional: Evita duplicados si el producto ya existe en el catálogo
        //         if (state.currentUser) {
        //             const exists = state.currentUser.some(p => p.id === newUser.id);
        //             if (!exists) {
        //                 state.currentUser.push(newUser);
        //             }
        //         }
        //     });
        // },
        login(state, action: PayloadAction<UserLogin>) {
            state.currentUser = action.payload;
            if(state.currentUser.user && state.currentUser.password) {
                state.isAuthenticated = true;
            } else {
                state.isAuthenticated = false;
            }
            
        },
        logout(state) {
            state.currentUser = null;
            state.isAuthenticated = false;
        }
    },
    // extraReducers: builder => {
    //     // 3 states
    //     // Pending. Asynchronous action is in progress to be delivered
    //     // fulfilled. Asynchronous action is completed and data is retrieved
    //     // rejected. Asynchronous action failed
    //     // state. Retrieves state information (data)
    //     // action. Gatheres all information from the operation
    //     builder
    //         .addCase(login.pending, (state, action) => {
    //             console.log('pending', action);
    //             state.status = LOADING;
    //         })
    //         .addCase(login.fulfilled, (state, action) => {
    //             console.log('fulfilled', action);
    //             state.tasks = action.payload;
    //             state.status = SUCCEEDED;
    //         })
    //         .addCase(login.rejected, (state, action) => {
    //             console.log('rejected', action);
    //             state.status = FAILED;
    //         })
    // }
});

// Export actions and reducer
export const { login, logout } = authSlice.actions;

const { reducer: authReducer } = authSlice;
export default authReducer;