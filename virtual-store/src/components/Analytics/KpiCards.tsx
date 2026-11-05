import { formatMoney } from '../../lib/format';
import type { ChangeKey, SummaryReport } from '../interfaces/analyticsParameters';
import { formatPercent, formatShortDate } from './analyticsUtils';
import { StyledKpi, StyledKpis } from './styles';

interface Kpi {
    label: string;
    value: string;
    change?: ChangeKey;
    note?: string;
}

const Delta = ({ value, previous }: { value: number | null; previous: string }) => {
    if (value === null) return <span className='delta'>Sin datos del periodo anterior</span>;
    const direction = value > 0 ? 'up' : value < 0 ? 'down' : '';
    const sign = value > 0 ? '+' : '';
    const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '■';
    return (
        <span className='delta'>
            <span className={direction}>
                {arrow} {sign}{formatPercent(value)}
            </span>{' '}
            vs {previous}
        </span>
    );
};

/** Headline numbers of the period, each compared with the previous period of equal length. */
const KpiCards = ({ summary, showCommission }: { summary: SummaryReport; showCommission: boolean }) => {
    const { current, change, previous_range } = summary;
    const previous = `${formatShortDate(previous_range.start)} – ${formatShortDate(previous_range.end)}`;
    const kpis: Kpi[] = [
        { label: 'Ventas (IVA incluido)', value: formatMoney(current.sales_total), change: 'sales_total' },
        { label: 'Ventas sin IVA', value: formatMoney(current.net_sales), change: 'net_sales' },
        { label: 'Pedidos', value: current.orders.toLocaleString('es-MX'), change: 'orders' },
        { label: 'Ticket promedio', value: formatMoney(current.average_ticket), change: 'average_ticket' },
        { label: 'Unidades vendidas', value: current.units.toLocaleString('es-MX'), change: 'units' },
        {
            label: 'Reembolsos',
            value: formatMoney(current.refunds_total),
            note: `${current.refunds_count} pedido(s) reembolsado(s)`,
        },
        {
            label: 'IVA y envío',
            value: formatMoney(current.tax_total),
            note: `IVA contenido · envío cobrado ${formatMoney(current.shipping_total)}`,
        },
    ];
    if (showCommission) {
        kpis.push({ label: 'Comisiones', value: formatMoney(current.commission_total), note: 'De ventas con vendedor asignado' });
    }

    return (
        <StyledKpis>
            {kpis.map((kpi) => (
                <StyledKpi key={kpi.label}>
                    <span className='label'>{kpi.label}</span>
                    <span className='value'>{kpi.value}</span>
                    {kpi.change && <Delta value={change[kpi.change]} previous={previous} />}
                    {kpi.note && <span className='delta'>{kpi.note}</span>}
                </StyledKpi>
            ))}
        </StyledKpis>
    );
};

export default KpiCards;
