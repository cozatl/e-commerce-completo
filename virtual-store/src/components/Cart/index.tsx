import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../store/store.ts';
import { useAppSelector } from '../Hooks/hooks.ts';
import { images } from '../utils/images.ts';
import { StyledCart, StyledCartItem } from './styles.ts';
import { clearCartError, removeFromCart, toggleCart, updateCartItem } from './cartSlice.ts';
import {
    selectCartError,
    selectCartHasProblems,
    selectCartItems,
    selectIsCartOpen,
    selectPendingItemIds,
    selectTotalPrice,
    selectTotalQty,
} from './cartSelectors.ts';
import { selectIsAuthenticated } from '../Auth/authSelectors.ts';
import type { CartItem } from '../interfaces/cartParameters.ts';

const DIGITAL_TYPES = ['software', 'ebook', 'video'];

interface CartRowProps {
    item: CartItem;
    pending: boolean;
}

/** One cart row. The quantity input is committed on blur / Enter, not on every keystroke. */
const CartRow = ({ item, pending }: CartRowProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [draft, setDraft] = useState(String(item.quantity));
    const isDigital = DIGITAL_TYPES.includes(item.product.product_type);
    const atMax = item.quantity >= item.max_quantity;

    // Keep the input in sync with what the server answered (or reset it after a rejected change).
    useEffect(() => {
        setDraft(String(item.quantity));
    }, [item.quantity]);

    const setQuantity = (quantity: number) => {
        if (quantity === item.quantity) return;
        if (quantity <= 0) {
            dispatch(removeFromCart(item.id));
        } else {
            dispatch(updateCartItem({ id: item.id, quantity }));
        }
    };

    const commitDraft = () => {
        const value = parseInt(draft, 10);
        if (isNaN(value)) {
            setDraft(String(item.quantity));
            return;
        }
        setQuantity(value);
    };

    return (
        <StyledCartItem>
            {item.product.image
                ? <img alt={item.product.name} src={item.product.image} />
                : <span aria-hidden='true' />}
            <p>{item.product.name}</p>
            <p>$ {item.subtotal}</p>
            <i>
                <img
                    src={images['trash-2.svg']}
                    alt='Delete item'
                    aria-disabled={pending}
                    onClick={() => !pending && dispatch(removeFromCart(item.id))}
                />
            </i>
            <div>
                {isDigital ? (
                    <small>Digital product · 1 per order</small>
                ) : (
                    <>
                        <button
                            onClick={() => setQuantity(item.quantity + 1)}
                            disabled={pending || atMax}
                            title={atMax ? `Only ${item.max_quantity} in stock` : undefined}
                        >+</button>
                        <input
                            type='number'
                            aria-label={`Quantity of ${item.product.name}`}
                            value={draft}
                            min={1}
                            max={item.max_quantity}
                            disabled={pending}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commitDraft}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') e.currentTarget.blur();
                            }}
                            style={{ width: '50px', textAlign: 'center', margin: '0 5px' }}
                        />
                        <button
                            onClick={() => setQuantity(item.quantity - 1)}
                            disabled={pending}
                        >-</button>
                    </>
                )}
            </div>
            {item.problem && <p role='alert'>{item.problem}</p>}
        </StyledCartItem>
    );
};

const Cart = () => {
    // variable to navigate to one path by clicking a button
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const isCartOpen = useAppSelector(selectIsCartOpen);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const cartItems = useAppSelector(selectCartItems);
    const totalQty = useAppSelector(selectTotalQty);
    const totalPrice = useAppSelector(selectTotalPrice);
    const hasProblems = useAppSelector(selectCartHasProblems);
    const error = useAppSelector(selectCartError);
    const pendingIds = useAppSelector(selectPendingItemIds);

    const goTo = (path: string) => {
        navigate(path);
        dispatch(toggleCart());
    };

    return (
        <StyledCart $isOpen={isCartOpen}>
            <h2>Cart</h2>
            {error && (
                <p role='alert'>
                    {error}{' '}
                    <button onClick={() => dispatch(clearCartError())} aria-label='Dismiss error'>×</button>
                </p>
            )}
            {!isAuthenticated ? (
                <div>
                    <p>Log in to see your cart.</p>
                    <button onClick={() => goTo('/login')}>Log in</button>
                </div>
            ) : (
                <>
                    {cartItems.length === 0 && <p>Your cart is empty.</p>}
                    {cartItems.map((item) => (
                        <CartRow key={item.id} item={item} pending={pendingIds.includes(item.id)} />
                    ))}
                    <div>
                        <p>Total ({totalQty}): $ {totalPrice}</p>
                        {hasProblems && <p>Fix the items marked above before buying.</p>}
                        <button
                            onClick={() => goTo('/checkout')}
                            disabled={totalQty <= 0 || hasProblems}>Buy
                        </button>
                    </div>
                </>
            )}
        </StyledCart>
    );
};

export default Cart;
