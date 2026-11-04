import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { formatMoney, formatRate } from '../../lib/format';
import { useFetch } from '../../lib/useFetch';
import type { AppDispatch } from '../../store/store';
import { useAppSelector } from '../Hooks/hooks';
import { fetchCart } from '../Cart/cartSlice';
import { selectCartHasProblems, selectCartItems, selectTotalPrice, selectTotalQty } from '../Cart/cartSelectors';
import { StyledError } from '../Theme/components';
import AddressForm from '../Addresses/AddressForm';
import { StyledActions, StyledItemRow, StyledList, StyledNotice, StyledPage, StyledPanel, StyledTotals } from '../Orders/styles';
import { formatAddress, type Address } from '../interfaces/addressParameters';
import type { CheckoutQuote, CreateOrderPayload, Order } from '../interfaces/orderParameters';

/**
 * /checkout — review the cart, pick the shipping address and place the order.
 * Placing it reserves the stock for a few minutes; payment happens on the order page.
 * Every amount comes from the server (GET /checkout/quote/).
 */
const CheckOut = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const cartItems = useAppSelector(selectCartItems);
    const totalQty = useAppSelector(selectTotalQty);
    const cartTotal = useAppSelector(selectTotalPrice);
    const hasProblems = useAppSelector(selectCartHasProblems);
    const needsShipping = cartItems.some((item) => item.product.product_type === 'physical');

    const { data: addresses, loading: loadingAddresses, refetch: refetchAddresses } = useFetch<Address[]>('/addresses/');
    const [addressId, setAddressId] = useState<number | null>(null);
    const [addingAddress, setAddingAddress] = useState(false);
    const [notes, setNotes] = useState('');
    const [placing, setPlacing] = useState(false);
    const [placeError, setPlaceError] = useState('');

    // Preselect the default address once the list arrives
    useEffect(() => {
        if (addressId !== null || !addresses?.length) return;
        setAddressId((addresses.find((a) => a.is_default) ?? addresses[0]).id);
    }, [addresses, addressId]);

    // The quote needs an address only when something has to be shipped
    const canQuote = totalQty > 0 && !hasProblems && (!needsShipping || addressId !== null);
    const { data: quote, loading: quoting, error: quoteError, refetch: refetchQuote } = useFetch<CheckoutQuote>(
        canQuote ? '/checkout/quote/' : null,
        { address: addressId ?? undefined },
    );

    // Quantities changed in the cart drawer: ask for fresh totals (skip the first render)
    const cartKey = `${totalQty}:${cartTotal}`;
    const lastCartKey = useRef(cartKey);
    useEffect(() => {
        if (lastCartKey.current === cartKey) return;
        lastCartKey.current = cartKey;
        if (canQuote) refetchQuote();
    }, [cartKey, canQuote, refetchQuote]);

    const handleAddressSaved = (address: Address) => {
        setAddingAddress(false);
        setAddressId(address.id);
        refetchAddresses();
    };

    const placeOrder = async () => {
        setPlacing(true);
        setPlaceError('');
        try {
            const payload: CreateOrderPayload = { notes };
            if (addressId !== null) payload.address = addressId;
            const order = await api.post<Order>('/orders/', payload);
            // The server emptied the cart: sync the drawer
            dispatch(fetchCart());
            navigate(`/orders/${order.order_id}`, { state: { justPlaced: true } });
        } catch (err) {
            setPlaceError(getErrorMessage(err, 'Could not place the order.'));
            dispatch(fetchCart()); // stock may have changed: show the problems in the cart
            setPlacing(false);
        }
    };

    if (totalQty <= 0) {
        return (
            <StyledPage>
                <h2>Checkout</h2>
                <p>Your cart is empty.</p>
                <div><Link to='/store'>Back to the store</Link></div>
            </StyledPage>
        );
    }

    const canPlace = canQuote && !!quote && !quoting && !quoteError && !placing;

    return (
        <StyledPage>
            <h2>Checkout</h2>

            <StyledPanel>
                <h3>Products</h3>
                <StyledList>
                    {cartItems.map((item) => (
                        <StyledItemRow key={item.id}>
                            <span>{item.product.name} × {item.quantity}</span>
                            <span>{formatMoney(item.subtotal)}</span>
                        </StyledItemRow>
                    ))}
                </StyledList>
                {hasProblems && (
                    <StyledError role='alert'>Some products in your cart need attention. Open the cart to fix them.</StyledError>
                )}
            </StyledPanel>

            <StyledPanel>
                <h3>{needsShipping ? 'Shipping address' : 'Address (optional, digital products only)'}</h3>
                {loadingAddresses && !addresses && <p role='status'>Loading addresses...</p>}
                {addresses && addresses.length > 0 && !addingAddress && (
                    <div role='radiogroup' aria-label='Shipping address'>
                        {!needsShipping && (
                            <label style={{ display: 'block' }}>
                                <input
                                    type='radio'
                                    name='address'
                                    checked={addressId === null}
                                    onChange={() => setAddressId(null)}
                                /> No address
                            </label>
                        )}
                        {addresses.map((address) => (
                            <label key={address.id} style={{ display: 'block', margin: '6px 0' }}>
                                <input
                                    type='radio'
                                    name='address'
                                    value={address.id}
                                    checked={addressId === address.id}
                                    onChange={() => setAddressId(address.id)}
                                />{' '}
                                <strong>{address.label || address.recipient_name}</strong> — {formatAddress(address)}
                            </label>
                        ))}
                    </div>
                )}
                {addingAddress || (addresses && addresses.length === 0 && needsShipping) ? (
                    <AddressForm
                        onSaved={handleAddressSaved}
                        onCancel={addresses && addresses.length > 0 ? () => setAddingAddress(false) : undefined}
                        submitLabel='Save and use this address'
                    />
                ) : (
                    <div><button type='button' onClick={() => setAddingAddress(true)}>Add a new address</button></div>
                )}
            </StyledPanel>

            <StyledPanel>
                <h3>Summary</h3>
                {!canQuote && needsShipping && addressId === null && <p>Choose an address to calculate shipping.</p>}
                {quoting && <p role='status'>Calculating totals...</p>}
                {quoteError && <StyledError role='alert'>{getErrorMessage(quoteError, 'Could not calculate the totals.')}</StyledError>}
                {quote && !quoteError && (
                    <StyledTotals aria-label='Order summary'>
                        <dt>Products</dt>
                        <dd>{formatMoney(quote.items_subtotal)}</dd>
                        {quote.needs_shipping && (
                            <>
                                <dt>Shipping ({quote.shipping_zone_name})</dt>
                                <dd>
                                    {Number(quote.shipping_cost) === 0 ? 'Free' : formatMoney(quote.shipping_cost)}
                                    {quote.free_shipping_applied && ' (free over the minimum)'}
                                </dd>
                            </>
                        )}
                        <dt className='total'>Total</dt>
                        <dd className='total'>{formatMoney(quote.total)}</dd>
                        <dt className='muted'>VAT {formatRate(quote.tax_rate)} included</dt>
                        <dd className='muted'>{formatMoney(quote.tax_amount)}</dd>
                        <dt className='muted'>Amount before VAT</dt>
                        <dd className='muted'>{formatMoney(Number(quote.total) - Number(quote.tax_amount))}</dd>
                    </StyledTotals>
                )}
                <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                    Notes for your order (optional)
                    <textarea rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </label>
                {quote && (
                    <StyledNotice>
                        Placing the order reserves the products for {quote.reservation_minutes} minutes while you pay.
                    </StyledNotice>
                )}
                {placeError && <StyledError role='alert'>{placeError}</StyledError>}
                <StyledActions>
                    <button type='button' onClick={placeOrder} disabled={!canPlace}>
                        {placing ? 'Placing order...' : 'Place order'}
                    </button>
                </StyledActions>
            </StyledPanel>
        </StyledPage>
    );
};

export default CheckOut;
