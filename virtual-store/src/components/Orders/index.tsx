import { Link, useSearchParams } from 'react-router-dom';
import type { Paginated } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { formatDateTime, formatMoney } from '../../lib/format';
import { useFetch } from '../../lib/useFetch';
import { StyledError } from '../Theme/components';
import type { OrderListItem } from '../interfaces/orderParameters';
import { StyledActions, StyledBadge, StyledItemRow, StyledList, StyledPage } from './styles';

/** /orders — the customer's orders, newest first (10 per page). */
const OrdersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const { data, loading, error } = useFetch<Paginated<OrderListItem>>('/orders/', { page });

    const goTo = (next: number) => setSearchParams(next > 1 ? { page: String(next) } : {});

    return (
        <StyledPage>
            <h2>My orders</h2>
            {loading && !data && <p role='status'>Loading orders...</p>}
            {error && <StyledError role='alert'>{getErrorMessage(error, 'Could not load your orders.')}</StyledError>}
            {data && data.results.length === 0 && (
                <p>You have no orders yet. <Link to='/store'>Go to the store</Link></p>
            )}
            {data && data.results.length > 0 && (
                <StyledList>
                    {data.results.map((order) => (
                        <StyledItemRow key={order.order_id}>
                            <span>
                                <Link to={`/orders/${order.order_id}`}>{order.order_id}</Link>{' '}
                                <StyledBadge $status={order.status}>{order.status_display}</StyledBadge>
                                {order.cancel_requested_at && ' · cancellation requested'}
                                <br />
                                <small>{formatDateTime(order.created_at)} · {order.item_count} item(s)</small>
                            </span>
                            <span>
                                {formatMoney(order.total)}
                                {order.can_pay && (
                                    <>
                                        <br />
                                        <Link to={`/orders/${order.order_id}`}>Pay now</Link>
                                    </>
                                )}
                            </span>
                        </StyledItemRow>
                    ))}
                </StyledList>
            )}
            {data && (data.previous || data.next) && (
                <StyledActions>
                    <button onClick={() => goTo(page - 1)} disabled={!data.previous}>Previous</button>
                    <span>Page {page}</span>
                    <button onClick={() => goTo(page + 1)} disabled={!data.next}>Next</button>
                </StyledActions>
            )}
        </StyledPage>
    );
};

export default OrdersPage;
