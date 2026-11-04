import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ApiError, api } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { formatCountdown, formatDateTime, formatMoney, formatRate } from '../../lib/format';
import { useCountdown } from '../../lib/useCountdown';
import { useFetch } from '../../lib/useFetch';
import type { AppDispatch } from '../../store/store';
import { useAppSelector } from '../Hooks/hooks';
import { selectCurrentUser } from '../Auth/authSelectors';
import { fetchCart } from '../Cart/cartSlice';
import { StyledError } from '../Theme/components';
import { StyledSuccess } from '../Profile/styles';
import { formatAddress } from '../interfaces/addressParameters';
import type { Order, PaymentOutcome } from '../interfaces/orderParameters';
import PaymentForm from './PaymentForm';
import {
    StyledActions,
    StyledBadge,
    StyledItemRow,
    StyledList,
    StyledNotice,
    StyledPage,
    StyledPanel,
    StyledTotals,
} from './styles';

/** Wait after the countdown ends before asking the server (and between retries). */
export const EXPIRY_RETRY_MS = 1000;

/** /orders/:orderId — order summary, simulated payment while pending, cancellation. */
const OrderDetail = () => {
    const { orderId = '' } = useParams();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const user = useAppSelector(selectCurrentUser);
    const justPlaced = Boolean((location.state as { justPlaced?: boolean } | null)?.justPlaced);

    const { data, loading, error, refetch } = useFetch<Order>(`/orders/${orderId}/`);
    // Latest version returned by an action (pay/cancel); falls back to the fetched one
    const [updated, setUpdated] = useState<Order | null>(null);
    const order = updated && updated.order_id === orderId ? updated : data;

    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState('');
    const [message, setMessage] = useState('');
    const [reason, setReason] = useState('');
    const [confirmCancel, setConfirmCancel] = useState(false);

    // A refetch replaces whatever an action returned
    useEffect(() => setUpdated(null), [data]);

    const secondsLeft = useCountdown(order?.can_pay ? order.expires_in_seconds : null);

    // Time is up: ask the server, which expires the order and refills the cart. If it
    // still answers "pending" (the request arrived a moment early), every answer is a
    // new `order` object, so this runs again and retries one second later.
    useEffect(() => {
        if (secondsLeft !== 0 || !order?.can_pay) return;
        const id = setTimeout(refetch, EXPIRY_RETRY_MS);
        return () => clearTimeout(id);
    }, [secondsLeft, order, refetch]);

    // Reload the cart only once the server answered "expired": by then the products are
    // back in it. (Fetching it at the same time as the order could read it still empty.)
    const status = order?.status;
    const previousStatus = useRef(status);
    useEffect(() => {
        if (status === 'expired' && previousStatus.current !== 'expired') dispatch(fetchCart());
        previousStatus.current = status;
    }, [status, dispatch]);

    const runAction = async (request: () => Promise<Order>, success: string) => {
        setBusy(true);
        setActionError('');
        setMessage('');
        try {
            setUpdated(await request());
            setMessage(success);
        } catch (err) {
            setActionError(getErrorMessage(err));
            // 409 = the order changed meanwhile (expired, already paid...): show the real state
            // (if it expired, the status effect above reloads the cart)
            if (err instanceof ApiError && err.status === 409) refetch();
        } finally {
            setBusy(false);
        }
    };

    const pay = (outcome: PaymentOutcome) =>
        runAction(
            () => api.post<Order>(`/orders/${orderId}/pay/`, { outcome }),
            `Payment approved. We sent the confirmation to ${user?.email ?? 'your email'}.`,
        );

    const cancel = () =>
        runAction(async () => {
            const result = await api.post<Order>(`/orders/${orderId}/cancel/`, { reason });
            setConfirmCancel(false);
            return result;
        }, order?.can_cancel ? 'The order was cancelled.' : 'Cancellation requested. We will review it and contact you.');

    if (loading && !order) return <StyledPage><p role='status'>Loading order...</p></StyledPage>;
    if (error && !order) {
        const notFound = error instanceof ApiError && error.status === 404;
        return (
            <StyledPage>
                <StyledError role='alert'>{notFound ? 'Order not found.' : getErrorMessage(error)}</StyledError>
                <div><Link to='/orders'>My orders</Link></div>
            </StyledPage>
        );
    }
    if (!order) return null;

    const cancellationPending = !!order.cancel_requested_at && ['paid', 'shipped', 'delivered'].includes(order.status);

    return (
        <StyledPage>
            <h2>
                Order {order.order_id} <StyledBadge $status={order.status}>{order.status_display}</StyledBadge>
            </h2>
            <p style={{ margin: 0 }}>Placed on {formatDateTime(order.created_at)}</p>

            {message && <StyledSuccess role='status'>{message}</StyledSuccess>}
            {actionError && <StyledError role='alert'>{actionError}</StyledError>}

            {order.can_pay && (
                <StyledPanel>
                    <h3>Payment</h3>
                    {justPlaced && !message && <p style={{ margin: 0 }}>Your products are reserved. Complete the payment to confirm the order.</p>}
                    {secondsLeft !== null && (
                        <StyledNotice role='timer' aria-live='off'>
                            Time left to pay: <strong>{formatCountdown(secondsLeft)}</strong>
                        </StyledNotice>
                    )}
                    <PaymentForm total={formatMoney(order.total)} paying={busy} onPay={pay} />
                </StyledPanel>
            )}
            {order.status === 'expired' && (
                <StyledNotice>The reservation expired before payment. The products went back to your cart.</StyledNotice>
            )}

            <StyledPanel>
                <h3>Products</h3>
                <StyledList>
                    {order.items.map((item) => (
                        <StyledItemRow key={item.id}>
                            <span>{item.product_name} × {item.quantity} <small>({formatMoney(item.unit_price)} each)</small></span>
                            <span>{formatMoney(item.subtotal)}</span>
                        </StyledItemRow>
                    ))}
                </StyledList>
                <StyledTotals aria-label='Order totals'>
                    <dt>Products</dt>
                    <dd>{formatMoney(order.items_subtotal)}</dd>
                    {order.needs_shipping && (
                        <>
                            <dt>Shipping ({order.shipping_zone_name})</dt>
                            <dd>{Number(order.shipping_cost) === 0 ? 'Free' : formatMoney(order.shipping_cost)}</dd>
                        </>
                    )}
                    <dt className='total'>Total</dt>
                    <dd className='total'>{formatMoney(order.total)} {order.currency}</dd>
                    <dt className='muted'>VAT {formatRate(order.tax_rate)} included</dt>
                    <dd className='muted'>{formatMoney(order.tax_amount)}</dd>
                    <dt className='muted'>Amount before VAT</dt>
                    <dd className='muted'>{formatMoney(order.subtotal_before_tax)}</dd>
                </StyledTotals>
            </StyledPanel>

            {order.shipping_address && (
                <StyledPanel>
                    <h3>Shipping to</h3>
                    <p style={{ margin: 0 }}>{order.shipping_address.recipient_name} · {order.shipping_address.phone}</p>
                    <p style={{ margin: 0 }}>{formatAddress(order.shipping_address)}</p>
                    {order.shipping_address.references && <p style={{ margin: 0 }}>References: {order.shipping_address.references}</p>}
                    {order.tracking_number && <p style={{ margin: 0 }}>Tracking number: {order.tracking_number}</p>}
                </StyledPanel>
            )}

            {(order.can_cancel || order.can_request_cancellation) && (
                <StyledPanel>
                    <h3>{order.can_cancel ? 'Cancel order' : 'Request a cancellation'}</h3>
                    {!order.can_cancel && (
                        <p style={{ margin: 0 }}>
                            Paid orders are reviewed by our team (refund or return of the products).
                        </p>
                    )}
                    {confirmCancel ? (
                        <>
                            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                                Reason (optional)
                                <textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
                            </label>
                            <StyledActions>
                                <button onClick={cancel} disabled={busy}>
                                    {order.can_cancel ? 'Yes, cancel the order' : 'Send request'}
                                </button>
                                <button onClick={() => setConfirmCancel(false)} disabled={busy}>Keep the order</button>
                            </StyledActions>
                        </>
                    ) : (
                        <div>
                            <button onClick={() => setConfirmCancel(true)} disabled={busy}>
                                {order.can_cancel ? 'Cancel order' : 'Request cancellation'}
                            </button>
                        </div>
                    )}
                </StyledPanel>
            )}
            {cancellationPending && (
                <StyledNotice>
                    Cancellation requested on {formatDateTime(order.cancel_requested_at)}. Our team is reviewing it.
                </StyledNotice>
            )}

            <div><Link to='/orders'>Back to my orders</Link></div>
        </StyledPage>
    );
};

export default OrderDetail;
