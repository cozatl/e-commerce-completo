import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Header from '../Header/index';
import cartReducer from '../Cart/cartSlice';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { BrowserRouter } from 'react-router-dom';

const mockStore = configureStore([]);

// Real initial cart state; the count shown in the header comes from the server total.
const initialCartState = cartReducer(undefined, { type: '@@INIT' });

describe('Header Component', () => {
  it('renders app name and cart count correctly when authenticated', async () => {
    // Initialize user-event session
    const user = userEvent.setup();
    // Define global state which will be read by useSelector
    const store = mockStore({
      auth: { isAuthenticated: true },
      cart: { ...initialCartState, totalQuantity: 5 },
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
    expect(screen.getByText('5')).toBeInTheDocument(); // cart count from the server total
    
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
      cart: { ...initialCartState, totalQuantity: 5 },
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
