import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { UserSignUp } from '../interfaces/signUpParameters';
import { IDLE } from '../../store/status';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../Auth';
import authReducer, { login, logout } from '../Auth/authSlice';
import { UserLogin } from '../interfaces/authParameters';

const mockStore = configureStore([]);


const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

type SignUpState = {
    user: UserSignUp[],
    status: string,
    errors: {}
    
};

const initialSignupState: SignUpState = {
    user: [],
    status: IDLE,
    errors: {},
};

type AuthState = {
    currentUser: UserLogin | null;
    // status: string,
    isAuthenticated: boolean;
    errors: {};
    
}

const initialAuthState: AuthState = {
    currentUser: null,
    // status: IDLE,
    isAuthenticated: false,
    errors: {},
};

describe('Auth Component', () => {
  it('should simulate click and dispatch login when user exists', async () => {
    // Initialize user-event session
    const user = userEvent.setup();
    // Define global state which will be read by useSelector
    const store = mockStore({
      auth: { isAuthenticated: true },
    //   cart: { ...initialCartState, items:[{quantity: 5}] },
      menu: { isOpen: false },
      signUp: { ...initialSignupState, user:[{user:'admin', password:'admin'}]}
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    render(
      <ThemeProvider theme={Theme}>
        <BrowserRouter>
        <Provider store={store}>
            <LoginPage
            />
        </Provider>
        </BrowserRouter>
      </ThemeProvider>
    ); 

    const userInput = screen.getByLabelText(/User/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const btnSubmit = screen.getByRole('button', { name: /Log In/i });  // Find Menu Icon

    // Simulate user inputs were filled and ready to be submitted
    await user.type(userInput, 'admin');
    await user.type(passwordInput, 'admin');

    // Simulate human clicking interaction
    await user.click(btnSubmit);

    // Validate that dispatch was executed
    expect(dispatchSpy).toHaveBeenCalled();

    // Validate that payload has the correct values
    expect(dispatchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('login'),
        payload: {
          user: 'admin',
          password: 'admin'
        }
      })
    );

    // Validate that navigate('/store') was called after finding the user (NOT USEFUL WHEN TESTING href ELEMENTS)
    expect(mockNavigate).toHaveBeenCalledWith('/store');
  });

  it('should simulate click and dispatch login when user exists', async () => {
    // Initialize user-event session
    const user = userEvent.setup();
    // Define global state which will be read by useSelector
    const store = mockStore({
      auth: { isAuthenticated: true },
    //   cart: { ...initialCartState, items:[{quantity: 5}] },
      menu: { isOpen: false },
      signUp: { ...initialSignupState, user:[{user:'admin', password:'admin'}]}
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    render(
      <ThemeProvider theme={Theme}>
        <BrowserRouter>
        <Provider store={store}>
            <LoginPage
            />
        </Provider>
        </BrowserRouter>
      </ThemeProvider>
    ); 

    const userInput = screen.getByLabelText(/User/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const btnSubmit = screen.getByRole('button', { name: /Log In/i });  // Find Menu Icon

    // Simulate user inputs were filled and ready to be submitted
    await user.type(userInput, 'admin');
    await user.type(passwordInput, 'admin1');

    // Simulate human clicking interaction
    await user.click(btnSubmit);

    // Validate that dispatch was executed
    expect(dispatchSpy).not.toHaveBeenCalled();

  });
  
  it('should authenticate the user if credentials are valid while log in', () => {
    // Initialize user-event session
    const validUser = { id: 1, user: 'admin', password: 'admin'};

    const nextState = authReducer(initialAuthState, login(validUser));

    expect(nextState.currentUser).toEqual(validUser);
    expect(nextState.isAuthenticated).toBe(true);
  });

  it('shouldn\'t authenticate the user if credentials are invalid while log in', () => {
    // Initialize user-event session
    const invalidUser = { id: 1, user: '', password: ''};

    const nextState = authReducer(initialAuthState, login(invalidUser));

    expect(nextState.isAuthenticated).toBe(false);
  });

  it('should clean the user and set isAuthenticated to false when logout', () => {
    // Initialize user-event session
    const stateAuthenticated = {
      currentUser: { id: 1, user: 'admin', password: 'admin'},
      isAuthenticated: true,
      errors: {}
    }
    
    const nextState = authReducer(stateAuthenticated, logout());
    
    expect(nextState.currentUser).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
  });
});