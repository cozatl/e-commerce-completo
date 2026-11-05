import { useState } from 'react';
import type { Query } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { formatMoney } from '../../lib/format';
import { useFetch } from '../../lib/useFetch';
import { StyledError } from '../Theme/components';
import type {
    BreakdownReport,
    CategoriesReport,
    CommissionsReport,
    OperationsReport,
    TopProductsReport,
} from '../interfaces/analyticsParameters';
import { formatPercent } from './analyticsUtils';
import { StyledBacklog, StyledBar, StyledCard, StyledHeaderRow, StyledTable } from './styles';

interface SectionProps {
    query: Query;
}

const Status = ({ loading, error, label }: { loading: boolean; error: Error | null; label: string }) => (
    <>
        {loading && <p role='status' className='muted'>Cargando {label}...</p>}
        {error && <StyledError role='alert'>{getErrorMessage(error, `No se pudo cargar ${label}.`)}</StyledError>}
    </>
);

/** Rank rows with a thin bar proportional to the largest value. */
const ratio = (value: string | number, max: number) => (max > 0 ? Number(value) / max : 0);

// ---------------------------------------------------------------------------
export const TopProducts = ({ query }: SectionProps) => {
    const [orderBy, setOrderBy] = useState<'revenue' | 'units'>('revenue');
    const { data, loading, error } = useFetch<TopProductsReport>('/analytics/products/', {
        ...query,
        order_by: orderBy,
        limit: 10,
    });
    const rows = data?.results ?? [];
    const max = Math.max(0, ...rows.map((r) => (orderBy === 'units' ? r.units : Number(r.revenue))));

    return (
        <StyledCard>
            <StyledHeaderRow>
                <h3>Productos más vendidos</h3>
                <label>
                    <span className='muted'>Ordenar por </span>
                    <select value={orderBy} onChange={(e) => setOrderBy(e.target.value as 'revenue' | 'units')}>
                        <option value='revenue'>Importe</option>
                        <option value='units'>Unidades</option>
                    </select>
                </label>
            </StyledHeaderRow>
            <Status loading={loading && !data} error={error} label='los productos' />
            {data && rows.length === 0 && <p className='muted'>Sin ventas en este periodo.</p>}
            {rows.length > 0 && (
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th className='num'>Unidades</th>
                            <th className='num'>Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={`${r.product_id ?? 'x'}-${r.sku}`}>
                                <td>
                                    {r.name} <span className='muted'>· {r.sku}</span>
                                    <StyledBar $ratio={ratio(orderBy === 'units' ? r.units : r.revenue, max)} />
                                </td>
                                <td className='num'>{r.units}</td>
                                <td className='num'>{formatMoney(r.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            )}
        </StyledCard>
    );
};

// ---------------------------------------------------------------------------
export const Categories = ({ query }: SectionProps) => {
    const [level, setLevel] = useState<'top' | 'leaf'>('top');
    const { data, loading, error } = useFetch<CategoriesReport>('/analytics/categories/', { ...query, level });
    const rows = data?.categories ?? [];
    const max = Math.max(0, ...rows.map((r) => Number(r.revenue)));

    return (
        <StyledCard>
            <StyledHeaderRow>
                <h3>Ventas por categoría</h3>
                <select aria-label='Nivel de categoría' value={level} onChange={(e) => setLevel(e.target.value as 'top' | 'leaf')}>
                    <option value='top'>Categorías</option>
                    <option value='leaf'>Subcategorías</option>
                </select>
            </StyledHeaderRow>
            <Status loading={loading && !data} error={error} label='las categorías' />
            {data && rows.length === 0 && <p className='muted'>Sin ventas en este periodo.</p>}
            {rows.length > 0 && (
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th className='num'>Unidades</th>
                            <th className='num'>Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.category_id ?? 'none'}>
                                <td>
                                    {r.name}
                                    <StyledBar $ratio={ratio(r.revenue, max)} />
                                </td>
                                <td className='num'>{r.units}</td>
                                <td className='num'>{formatMoney(r.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            )}
            {data && data.product_types.length > 0 && (
                <StyledTable aria-label='Por tipo de producto'>
                    <thead>
                        <tr>
                            <th>Tipo de producto</th>
                            <th className='num'>Unidades</th>
                            <th className='num'>Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.product_types.map((t) => (
                            <tr key={t.product_type}>
                                <td>{t.label}</td>
                                <td className='num'>{t.units}</td>
                                <td className='num'>{formatMoney(t.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            )}
        </StyledCard>
    );
};

// ---------------------------------------------------------------------------
type BreakdownView = 'locations' | 'regions' | 'channels';

export const Breakdown = ({ query }: SectionProps) => {
    const [view, setView] = useState<BreakdownView>('locations');
    const { data, loading, error } = useFetch<BreakdownReport>('/analytics/breakdown/', query);

    const rows: { key: string; name: string; detail?: string; orders: number; total: string }[] = !data
        ? []
        : view === 'channels'
          ? data.channels.map((r) => ({ key: r.channel, name: r.label, orders: r.orders, total: r.total }))
          : view === 'regions'
            ? data.regions.map((r) => ({ key: r.region, name: r.region, orders: r.orders, total: r.total }))
            : data.locations.map((r) => ({
                  key: String(r.location_id ?? 'none'),
                  name: r.name,
                  detail: r.kind === 'store' ? r.region : r.kind_label,
                  orders: r.orders,
                  total: r.total,
              }));
    const max = Math.max(0, ...rows.map((r) => Number(r.total)));
    const sum = rows.reduce((acc, r) => acc + Number(r.total), 0);

    return (
        <StyledCard>
            <StyledHeaderRow>
                <h3>Ventas por canal y sucursal</h3>
                <select aria-label='Agrupar por' value={view} onChange={(e) => setView(e.target.value as BreakdownView)}>
                    <option value='locations'>Sucursal</option>
                    <option value='regions'>Región</option>
                    <option value='channels'>Canal</option>
                </select>
            </StyledHeaderRow>
            <Status loading={loading && !data} error={error} label='el desglose' />
            {data && rows.length === 0 && <p className='muted'>Sin ventas en este periodo.</p>}
            {rows.length > 0 && (
                <StyledTable>
                    <thead>
                        <tr>
                            <th>{view === 'channels' ? 'Canal' : view === 'regions' ? 'Región' : 'Sucursal'}</th>
                            <th className='num'>Pedidos</th>
                            <th className='num'>Ventas</th>
                            <th className='num'>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.key}>
                                <td>
                                    {r.name} {r.detail && <span className='muted'>· {r.detail}</span>}
                                    <StyledBar $ratio={ratio(r.total, max)} />
                                </td>
                                <td className='num'>{r.orders}</td>
                                <td className='num'>{formatMoney(r.total)}</td>
                                <td className='num'>{formatPercent(sum ? Math.round((Number(r.total) / sum) * 1000) / 10 : null)}</td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            )}
        </StyledCard>
    );
};

// ---------------------------------------------------------------------------
export const Operations = ({ query }: SectionProps) => {
    const { data, loading, error } = useFetch<OperationsReport>('/analytics/operations/', query);

    return (
        <StyledCard>
            <StyledHeaderRow>
                <h3>Operación</h3>
                {data && (
                    <span className='muted'>
                        {data.created} pedido(s) creados · {formatPercent(data.paid_rate)} llegaron a pagarse
                    </span>
                )}
            </StyledHeaderRow>
            <Status loading={loading && !data} error={error} label='la operación' />
            {data && (
                <>
                    <StyledBacklog aria-label='Pendientes ahora'>
                        <div>
                            <dt>Por enviar</dt>
                            <dd>{data.backlog.to_ship}</dd>
                        </div>
                        <div>
                            <dt>Cancelaciones por decidir</dt>
                            <dd>{data.backlog.cancellation_requests}</dd>
                        </div>
                        <div>
                            <dt>Esperando pago</dt>
                            <dd>{data.backlog.awaiting_payment}</dd>
                        </div>
                    </StyledBacklog>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>Estado (pedidos creados en el periodo)</th>
                                <th className='num'>Pedidos</th>
                                <th className='num'>Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.statuses.map((s) => (
                                <tr key={s.status}>
                                    <td>{s.label}</td>
                                    <td className='num'>{s.count}</td>
                                    <td className='num'>{formatMoney(s.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </>
            )}
        </StyledCard>
    );
};

// ---------------------------------------------------------------------------
export const Commissions = ({ query }: SectionProps) => {
    const { data, loading, error } = useFetch<CommissionsReport>('/analytics/commissions/', query);

    return (
        <StyledCard>
            <StyledHeaderRow>
                <h3>Comisiones de vendedores</h3>
                {data && <span className='muted'>Base: {data.base_label}</span>}
            </StyledHeaderRow>
            <Status loading={loading && !data} error={error} label='las comisiones' />
            {data && data.results.length === 0 && (
                <p className='muted'>No hay ventas con vendedor asignado en este periodo.</p>
            )}
            {data && data.results.length > 0 && (
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Vendedor</th>
                            <th className='num'>% actual</th>
                            <th className='num'>Pedidos</th>
                            <th className='num'>Ventas</th>
                            <th className='num'>Comisión</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.results.map((r) => (
                            <tr key={r.seller_id}>
                                <td>
                                    {r.name} <span className='muted'>· {r.email}</span>
                                </td>
                                <td className='num'>{r.current_percent ? `${Number(r.current_percent)}%` : '—'}</td>
                                <td className='num'>{r.orders}</td>
                                <td className='num'>{formatMoney(r.sales_total)}</td>
                                <td className='num'>{formatMoney(r.commission)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Total</td>
                            <td />
                            <td className='num'>{data.totals.orders}</td>
                            <td className='num'>{formatMoney(data.totals.sales_total)}</td>
                            <td className='num'>{formatMoney(data.totals.commission)}</td>
                        </tr>
                    </tfoot>
                </StyledTable>
            )}
            <p className='muted'>
                La comisión se congela con el porcentaje vigente al asignar al vendedor; los reembolsos no cuentan.
            </p>
        </StyledCard>
    );
};
