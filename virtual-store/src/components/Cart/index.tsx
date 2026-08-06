import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store.ts';
import { useAppSelector } from '../Hooks/hooks.ts';
import { images } from '../utils/images.ts';
import { StyledCart, StyledCartItem } from './styles.ts';
import { decrementQty, incrementQty, removeFromCart, setQuantity, toggleCart } from './cartSlice.ts';
import { selectCartItems, selectIsCartOpen, selectTotalQty } from './cartSelectors.ts';
import { useNavigate } from 'react-router-dom';


const Cart = () => {
    // variable to navigate to one path by clicking a button
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const isCartOpen = useAppSelector(selectIsCartOpen);
    const cartItems = useAppSelector(selectCartItems);
    const totalQty = useAppSelector(selectTotalQty);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, currentId: number) => {
        const val = parseInt(e.target.value, 10);
        // Allow empty string temporarily while typing, otherwise dispatch
        if (!isNaN(val)) {
            dispatch(setQuantity({ id: currentId!, quantity: val }));
        }
    };

    const handleIncrement = (cartId: number) => {
        dispatch(incrementQty(cartId));
    };

    const handleDecrement = (cartId: number) => {
        dispatch(decrementQty(cartId));
    };

    const handleCheckout = () => {
        navigate('/checkout');
        dispatch(toggleCart());
    };

    return (
        <StyledCart  $isOpen={isCartOpen} >
            <h2>Cart</h2>
            {cartItems.map(cart => (
                <StyledCartItem key={cart.id}>
                    <img alt={`${cart.name}`} src={`${cart.img}`} />
                    <p>{`${cart.name}`}</p>
                    <p>$ {`${cart.price}`}</p>
                    <i>
                        <img src={images['trash-2.svg']} alt="Delete item" onClick={() => dispatch(removeFromCart(cart.id))}/>
                    </i>
                    <div>
                        <button onClick={() => handleIncrement(cart.id)}>+</button>
                        <input
                            type="number"
                            value={cart.quantity}
                            onChange={(e) => handleInputChange(e, cart.id)}
                            min="0"
                            style={{ width: '50px', textAlign: 'center', margin: '0 5px' }}
                        />
                        <button onClick={() => handleDecrement(cart.id)}>-</button>
                    </div>
                </StyledCartItem>
                )
            )}
            <div>
                <button
                    onClick={handleCheckout}
                    disabled={ totalQty <=0 }>Buy
                </button>
            </div>
        </StyledCart>
    )
}

export default Cart;