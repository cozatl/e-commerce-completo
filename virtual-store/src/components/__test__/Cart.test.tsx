import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider } from 'styled-components';
import Theme from '../Theme';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../Cart';
import cartReducer, { addToCart, clearCart, decrementQty, incrementQty, removeFromCart, setQuantity, toggleCart } from '../Cart/cartSlice';
import { CartItem } from '../interfaces/cartParameters';
import { IDLE } from '../../store/status';
import { selectTotalPrice } from '../Cart/cartSelectors';
// import { StyledButtonCart } from '../Cart/styles';

const mockStore = configureStore([]);

describe('Cart Component', () => {
    type CartElements = {
        isCartOpen: boolean,
        items: CartItem[],
        status: string,
        errors: {}
        
    }
    
    const initialState: CartElements = {
        isCartOpen: false,
        items: [],
        status: IDLE,
        errors: {},
    };
    const initialFullState: CartElements = {
        isCartOpen: false,
        items: [{ id: 1, name: 'Product 1', price: 10, img:'img1.png', quantity: 5 }],
        status: IDLE,
        errors: {},
    };

    const mockCartItems = [
        { id: 1, name: 'Product 1', price: 10, img:'img1.png', quantity: 5 },
        { id: 2, name: 'Product 2', price: 15, img:'img2.png', quantity: 10 }
    ]

    it('should render product list correctly', () => {
        const store = mockStore({
            cart: { items: mockCartItems, isCartOpen: true }
        })

        render(
            <ThemeProvider theme={Theme}>
                <BrowserRouter>
                    <Provider store={store}>
                        <Cart
                        />
                    </Provider>
                </BrowserRouter>
            </ThemeProvider>
        );
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    it('should execute handleIncrement when clicking the button +', async () => {
        // Initialize user-event session
        const user = userEvent.setup();

        const store = mockStore({
            cart: { items: mockCartItems, isCartOpen: true }
        })
        
        const dispatchSpy = vi.spyOn(store, 'dispatch');
        render(
            <ThemeProvider theme={Theme}>
                <BrowserRouter>
                    <Provider store={store}>
                        <Cart
                        />
                    </Provider>
                </BrowserRouter>
            </ThemeProvider>
        );

        const incrementBtns = screen.getAllByRole('button', { name: '+' });

        await user.click(incrementBtns[0]);
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should execute handleDecrement when clicking the button -', async () => {
        // Initialize user-event session
        const user = userEvent.setup();

        const store = mockStore({
            cart: { items: mockCartItems, isCartOpen: true }
        })
        
        const dispatchSpy = vi.spyOn(store, 'dispatch');
        render(
            <ThemeProvider theme={Theme}>
                <BrowserRouter>
                    <Provider store={store}>
                        <Cart
                        />
                    </Provider>
                </BrowserRouter>
            </ThemeProvider>
        );

        const decrementBtns = screen.getAllByRole('button', { name: '-' });

        await user.click(decrementBtns[0]);
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should execute handleInputChange while writing a number in the input', async () => {
        // Initialize user-event session
        const user = userEvent.setup();

        const store = mockStore({
            cart: { items: mockCartItems, isCartOpen: true }
        })
        
        const dispatchSpy = vi.spyOn(store, 'dispatch');
        render(
            <ThemeProvider theme={Theme}>
                <BrowserRouter>
                    <Provider store={store}>
                        <Cart
                        />
                    </Provider>
                </BrowserRouter>
            </ThemeProvider>
        );

        const inputs = screen.getAllByRole('spinbutton');  // Get input type=number
        await user.clear(inputs[0]);
        await user.type(inputs[0], '5');

        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should dispatch delete action by clicking in the trask icon', async () => {
        // Initialize user-event session
        const user = userEvent.setup();

        const store = mockStore({
            cart: { items: mockCartItems, isCartOpen: true }
        })
        
        const dispatchSpy = vi.spyOn(store, 'dispatch');
        render(
            <ThemeProvider theme={Theme}>
                <BrowserRouter>
                    <Provider store={store}>
                        <Cart
                        />
                    </Provider>
                </BrowserRouter>
            </ThemeProvider>
        );

        const deleteIcons = screen.getAllByAltText('Delete item');
        await user.click(deleteIcons[0]);

        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should disable button Buy if totalQty <= 0 and enable it when totalQty > 0', async () => {
        // Initialize user-event session
        const user = userEvent.setup();

        const emptyStore = mockStore({
            cart: { items: [], isCartOpen: true }
        })
        
        const { rerender } = render(
            <ThemeProvider theme={Theme}>
                <BrowserRouter>
                    <Provider store={emptyStore}>
                        <Cart
                        />
                    </Provider>
                </BrowserRouter>
            </ThemeProvider>
        );

        const buyButton = screen.getByRole('button', { name: /Buy/i});
        expect(buyButton).toBeDisabled();

        const fullStore = mockStore({
            cart: { items: mockCartItems, isCartOpen: true }
        })
        
        const dispatchSpy = vi.spyOn(fullStore, 'dispatch');
        rerender(
            <ThemeProvider theme={Theme}>
                <BrowserRouter>
                    <Provider store={fullStore}>
                        <Cart
                        />
                    </Provider>
                </BrowserRouter>
            </ThemeProvider>
        );
        
        expect(buyButton).toBeEnabled();

        await user.click(buyButton);
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should add a cart Item', () => {
        // Initialize user-event session
        const cartItem = mockCartItems[0];

        let nextState = cartReducer(initialState, addToCart(cartItem));

        expect(nextState.items).toEqual([
            {
                ...cartItem,
                quantity: 1,
            }
        ]);
        nextState = cartReducer(nextState, addToCart(cartItem));
        expect(nextState.items[0].quantity).toBe(2);
    });

    it('should increment/decrement/set quantity', () => {
        // Initialize user-event session
        const cartItem = mockCartItems[0];

        let nextState = cartReducer(initialFullState, incrementQty(cartItem.id));
        expect(nextState.items[0].quantity).toEqual(6);
        nextState = cartReducer(nextState, incrementQty(cartItem.id));
        expect(nextState.items[0].quantity).toEqual(7);

        nextState = cartReducer(initialFullState, decrementQty(cartItem.id));
        expect(nextState.items[0].quantity).toEqual(4);
        nextState = cartReducer(nextState, decrementQty(cartItem.id));
        nextState = cartReducer(nextState, decrementQty(cartItem.id));
        nextState = cartReducer(nextState, decrementQty(cartItem.id));
        nextState = cartReducer(nextState, decrementQty(cartItem.id));
        expect(nextState.items).toHaveLength(0);

        nextState = cartReducer(initialFullState, setQuantity({ id: cartItem.id, quantity: 10 }));
        expect(nextState.items[0].quantity).toEqual(10);

        nextState = cartReducer(initialFullState, setQuantity({ id: cartItem.id, quantity: 0 }));
        expect(nextState.items).toHaveLength(0);
    });

    it('should remove item from the cart', () => {
        // Initialize user-event session
        const cartItem = mockCartItems[0];

        const nextState = cartReducer(initialFullState, removeFromCart(cartItem.id));
        expect(nextState.items).toEqual([]);
        expect(nextState.items).toHaveLength(0);
    });

    it('shouldn toggle cart', () => {
    
        let nextState = cartReducer(initialState, toggleCart());    
        expect(nextState.isCartOpen).toBe(true);

        nextState = cartReducer(nextState, toggleCart());    
        expect(nextState.isCartOpen).toBe(false);

        nextState = cartReducer(undefined, { type: '@@INIT'});    
        expect(nextState.isCartOpen).toBe(false);
    });

    it('shouldn clear cart', () => {
    
        const nextState = cartReducer(initialState, clearCart());
    
        expect(nextState.items).toEqual([]);
        expect(nextState.items).toHaveLength(0);
    });

    it('should remove item from the cart', () => {
        const mockRootState = {
            cart: { items: mockCartItems, isCartOpen: true }
        };

        const totalPrice = selectTotalPrice(mockRootState as any);
        expect(totalPrice).toBe(200);
    });
});
