import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { UserSignUp } from '../interfaces/signUpParameters';
import { IDLE } from '../../store/status';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { BrowserRouter } from 'react-router-dom';
import SignUpPage from '../SignUp';
import signUpReducer, { addUsers } from '../SignUp/signUpSlice';

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

describe('Auth Component', () => {
  it('should register one user and dispatch addUsers', async () => {
    // Initialize user-event session
    const user = userEvent.setup();
    // Define global state which will be read by useSelector
    const store = mockStore({
      signUp: { user: [{ id: 1, user: 'jesus', name: 'Jesus', password: '123' }]}
    });
    
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    render(
      <ThemeProvider theme={Theme}>
        <BrowserRouter>
        <Provider store={store}>
            <SignUpPage
            />
        </Provider>
        </BrowserRouter>
      </ThemeProvider>
    ); 
    
    const nameInput = screen.getByPlaceholderText(/name/i);
    const userInput = screen.getByPlaceholderText(/user/i);
    const passwordInput = screen.getByPlaceholderText('password');
    const confirmPasswordInput = screen.getByPlaceholderText('confirm password');
    const btnSubmit = screen.getByRole('button', { name: /Sign Up/i });

    // Simulate user inputs were filled and ready to be submitted
    await user.type(nameInput, 'Jesus Cozatl');
    await user.type(userInput, 'admin');
    await user.type(passwordInput, 'admin');
    await user.type(confirmPasswordInput, 'admin');

    // Simulate human clicking interaction
    await user.click(btnSubmit);

    // Validate that dispatch was executed
    expect(dispatchSpy).toHaveBeenCalled();

    // Validate if dispatched action was correct
    expect(dispatchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('addUsers'),
        payload: {
          id: 2,
          name: 'Jesus Cozatl',
          user: 'admin',
          password: 'admin'
        }
      })
    );
  });
  
  it('should alert if passwords don\'t match', async () => {
    // Initialize user-event session
    const user = userEvent.setup();
    const alertSpy = (vi.spyOn(window, 'alert').mockImplementation(() => {}))
    // Define global state which will be read by useSelector
    const store = mockStore({
      signUp: { user: []}
    });
    
    render(
      <ThemeProvider theme={Theme}>
        <BrowserRouter>
        <Provider store={store}>
            <SignUpPage
            />
        </Provider>
        </BrowserRouter>
      </ThemeProvider>
    ); 
    
    // Simulate user inputs were filled and ready to be submitted
    await user.type(screen.getByPlaceholderText(/name/i), 'Jesus Cozatl');
    await user.type(screen.getByPlaceholderText('password'), 'admin');
    await user.type(screen.getByPlaceholderText('confirm password'), 'admin1');
    const btnSubmit = screen.getByRole('button', { name: /Sign Up/i });

    // Simulate human clicking interaction
    await user.click(btnSubmit);

    // Validate if alert is displayed
    expect(alertSpy).toHaveBeenCalledWith('Passwords do not match!');
  });

  it('should alert if user already exists', async () => {
    // Initialize user-event session
    const user = userEvent.setup();
    const alertSpy = (vi.spyOn(window, 'alert').mockImplementation(() => {}))
    // Define global state which will be read by useSelector
    const store = mockStore({
      signUp: { user: [{ id: 1, user: 'jesus', name: 'Jesus', password: '123' }]}
    });
    
    render(
      <ThemeProvider theme={Theme}>
        <BrowserRouter>
        <Provider store={store}>
            <SignUpPage
            />
        </Provider>
        </BrowserRouter>
      </ThemeProvider>
    ); 
    
    // Simulate user inputs were filled and ready to be submitted
    await user.type(screen.getByPlaceholderText(/name/i), 'Jesus');
    await user.type(screen.getByPlaceholderText(/user/i), 'jesus');
    await user.type(screen.getByPlaceholderText('password'), '123');
    await user.type(screen.getByPlaceholderText('confirm password'), '123');
    const btnSubmit = screen.getByRole('button', { name: /Sign Up/i });

    // Simulate human clicking interaction
    await user.click(btnSubmit);

    // Validate if alert is displayed
    expect(alertSpy).toHaveBeenCalledWith('User name is already registered.');
  });

  it('should add one user to the state', async () => {    
    // Define global state which will be read by useSelector
    const newUser ={ id: 1, user: 'jesus', name: 'Jesus', password: '123' };

    const nextState = signUpReducer(initialSignupState, addUsers(newUser));

    // Validate if alert is displayed
    expect(nextState.user).toHaveLength(1);
    expect(nextState.user[0]).toEqual(newUser);
  });

  
});

afterEach(() => {
  vi.restoreAllMocks();
});