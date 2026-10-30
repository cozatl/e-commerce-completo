import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Header from '../Header/index';
import { CartItem } from '../interfaces/cartParameters';
import { IDLE } from '../../store/status';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { BrowserRouter } from 'react-router-dom';

const mockStore = configureStore([]);

type CartElements = {
    isCartOpen: boolean,
    items: CartItem[],
    status: string,
    errors: {}
};

const initialCartState: CartElements = {
    isCartOpen: false,
    items: [],
    status: IDLE,
    errors: {},
};

describe('Header Component', () => {
  it('renders app name and cart count correctly when authenticated', async () => {
    // Initialize user-event session
    const user = userEvent.setup();
    // Define global state which will be read by useSelector
    const store = mockStore({
      auth: { isAuthenticated: true },
      cart: { ...initialCartState, items:[{quantity: 5}] },
      menu: { isOpen: false }
    });
    
    const title = 'Virtual Store';
    render(
      <ThemeProvider theme={Theme}>
        <BrowserRouter>
        <Provider store={store}>
          {/* <Router> */}
            <Header appName= {title} />
          {/* </Router> */}
        </Provider>
        </BrowserRouter>
      </ThemeProvider>
    );
    
    const headerTitle = screen.getByText(`${title}`); // Validate title is displayed
    expect(headerTitle).toBeInTheDocument();
    
    const btnMenu = screen.getByRole('img', { name: /Menu Icon/i });  // Find Menu Icon

    // Simulate human clicking interaction
    await user.click(btnMenu);
    const botonHome = screen.getByRole('link', { name: /Home/i });  // Validate if menu was displayed
    expect(botonHome).toBeInTheDocument();
  });
  it('should toggle cart', async () => {
    // Initialize user-event session
    const user = userEvent.setup();
    // Define global state which will be read by useSelector
    const store = mockStore({
      auth: { isAuthenticated: true },
      cart: { ...initialCartState, items:[{quantity: 5}] },
      menu: { isOpen: false }
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const title = 'Virtual Store';
    render(
      <ThemeProvider theme={Theme}>
        <BrowserRouter>
        <Provider store={store}>
          {/* <Router> */}
            <Header appName= {title} />
          {/* </Router> */}
        </Provider>
        </BrowserRouter>
      </ThemeProvider>
    );
    const btnCart = screen.getByRole('img', { name: /Cart Icon/i });  // Find Menu Icon

    await user.click(btnCart);
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
