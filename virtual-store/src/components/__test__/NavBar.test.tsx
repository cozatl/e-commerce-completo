import { describe, it, expect, vi } from 'vitest';
import menuReducer, { toggleMenu } from '../NavBar/navBarSlice';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IDLE } from '../../store/status';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../Auth';
import Navbar from '../NavBar';
import { login, logout } from '../Auth/authSlice';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockStore = configureStore([]);

const initialAuthState = {
    isMenuOpen: false,
    // history: [],
    status: IDLE,
    errors: {},
};

describe('Auth Component', () => {    
  it('shouldn\'t authenticate the user if credentials are invalid while log in', () => {

    const nextState = menuReducer(initialAuthState, toggleMenu());

    expect(nextState.isMenuOpen).toBe(true);
  });

  it('should dispatch toggleMenu and logout when clicking Sing Out while user is authenticated', async () => {
        // Initialize user-event session
        const user = userEvent.setup();
        // Define global state which will be read by useSelector
        const store = mockStore({
        auth: { isAuthenticated: true }
        });
        
        const dispatchSpy = vi.spyOn(store, 'dispatch');
        render(
        <ThemeProvider theme={Theme}>
            <BrowserRouter>
            <Provider store={store}>
                <Navbar
                />
            </Provider>
            </BrowserRouter>
        </ThemeProvider>
        ); 

        const signOutLink = screen.getByRole('link', { name: /Sign Out/i });  // Find Menu button link

        // Simulate human clicking interaction
        await user.click(signOutLink);

        // Validate that dispatch was executed
        expect(dispatchSpy).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledWith(logout());
        expect(dispatchSpy).toHaveBeenCalledWith(toggleMenu());
        // Validate that navigate('/store') was called after finding the user
        expect(signOutLink).toHaveAttribute('href', '/store');
    });

    it('should dispatch toggleMenu and logout when clicking Sing Out while user is authenticated', async () => {
        // Initialize user-event session
        const user = userEvent.setup();
        // Define global state which will be read by useSelector
        const store = mockStore({
        auth: { isAuthenticated: false }
        });
        
        const dispatchSpy = vi.spyOn(store, 'dispatch');
        render(
        <ThemeProvider theme={Theme}>
            <BrowserRouter>
            <Provider store={store}>
                <Navbar
                />
            </Provider>
            </BrowserRouter>
        </ThemeProvider>
        ); 

        const signInLink = screen.getByRole('link', { name: /Sign In/i });  // Find Menu button link

        // Simulate human clicking interaction
        await user.click(signInLink);

        // Validate that dispatch was executed
        expect(dispatchSpy).toHaveBeenCalled();
        expect(dispatchSpy).not.toHaveBeenCalledWith(logout);
        expect(dispatchSpy).toHaveBeenCalledWith(toggleMenu());
        // Validate that href is present ('/')
        expect(signInLink).toHaveAttribute('href', '/');
    });

    it('should dispatch toggleMenu and logout when clicking Sing Out while user is authenticated', async () => {
        // Initialize user-event session
        const user = userEvent.setup();
        // Define global state which will be read by useSelector
        const store = mockStore({
        auth: { isAuthenticated: true }
        });
        
        const dispatchSpy = vi.spyOn(store, 'dispatch');
        render(
        <ThemeProvider theme={Theme}>
            <BrowserRouter>
            <Provider store={store}>
                <Navbar
                />
            </Provider>
            </BrowserRouter>
        </ThemeProvider>
        ); 

        const homeLink = screen.getByRole('link', { name: /Home/i });  // Find Menu button link

        // Simulate human clicking interaction
        await user.click(homeLink);

        // Validate that dispatch was executed
        expect(dispatchSpy).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledWith(toggleMenu());
    });
});