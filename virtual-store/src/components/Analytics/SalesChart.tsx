import { useState } from 'react';
import { formatMoney } from '../../lib/format';
import type { Channel, TimeseriesReport } from '../interfaces/analyticsParameters';
import { compactNumber, formatPeriod, formatPeriodLong, niceTicks } from './analyticsUtils';
import { GRID, SERIES, StyledChart, StyledHeaderRow, StyledLegend, StyledTable, StyledTooltip } from './styles';

const WIDTH = 760;
const HEIGHT = 260;
const PAD = { top: 12, right: 8, bottom: 26, left: 52 };
const GAP = 2; // surface gap between stacked segments
const RADIUS = 4;

const LABELS: Record<Channel, string> = { online: 'En línea', pos: 'Mostrador' };

/** Column path: rounded data-end (top), square at the baseline. */
const columnPath = (x: number, y: number, w: number, h: number, rounded: boolean) => {
    if (h <= 0) return '';
    const r = rounded ? Math.min(RADIUS, h, w / 2) : 0;
    return [
        `M${x},${y + h}`,
        `V${y + r}`,
        r ? `Q${x},${y} ${x + r},${y}` : '',
        `H${x + w - r}`,
        r ? `Q${x + w},${y} ${x + w},${y + r}` : '',
        `V${y + h}`,
        'Z',
    ].join(' ');
};

/**
 * Sales per day / week / month, stacked by channel (online at the base, counter on top).
 * Hover a column for its numbers; "Ver tabla" shows the same data as a table.
 */
const SalesChart = ({ report }: { report: TimeseriesReport }) => {
    const [hover, setHover] = useState<number | null>(null);
    const [asTable, setAsTable] = useState(false);
    const { points, interval } = report;

    const values = points.map((p) => ({ online: Number(p.online), pos: Number(p.pos), total: Number(p.total) }));
    const ticks = niceTicks(Math.max(0, ...values.map((v) => v.total)));
    const top = ticks[ticks.length - 1] || 1;
    const plotW = WIDTH - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const band = plotW / Math.max(points.length, 1);
    const barW = Math.max(2, Math.min(24, band * 0.7));
    const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
    const h = (v: number) => (v / top) * plotH;
    // Selective x labels: about 8 across the axis.
    const labelEvery = Math.max(1, Math.ceil(points.length / 8));
    const hasPos = values.some((v) => v.pos > 0);
    const empty = values.every((v) => v.total === 0);

    const hovered = hover !== null ? points[hover] : null;

    return (
        <>
            <StyledHeaderRow>
                <h3>Ventas por {interval === 'day' ? 'día' : interval === 'week' ? 'semana' : 'mes'}</h3>
                <StyledLegend aria-label='Leyenda'>
                    {(['online', 'pos'] as Channel[]).map((c) => (
                        <li key={c}>
                            <span className='swatch' style={{ background: SERIES[c] }} aria-hidden />
                            {LABELS[c]}
                        </li>
                    ))}
                </StyledLegend>
                <button type='button' onClick={() => setAsTable((v) => !v)} aria-pressed={asTable}>
                    {asTable ? 'Ver gráfica' : 'Ver tabla'}
                </button>
            </StyledHeaderRow>

            {empty && !asTable && <p className='muted'>Sin ventas en este periodo.</p>}

            {asTable ? (
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Periodo</th>
                            <th className='num'>Pedidos</th>
                            <th className='num'>En línea</th>
                            <th className='num'>Mostrador</th>
                            <th className='num'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {points.map((p) => (
                            <tr key={p.period}>
                                <td>{formatPeriodLong(p.period, interval)}</td>
                                <td className='num'>{p.orders}</td>
                                <td className='num'>{formatMoney(p.online)}</td>
                                <td className='num'>{formatMoney(p.pos)}</td>
                                <td className='num'>{formatMoney(p.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            ) : (
                <StyledChart onMouseLeave={() => setHover(null)}>
                    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role='img' aria-label='Gráfica de ventas por periodo'>
                        {ticks.map((t) => (
                            <g key={t}>
                                <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
                                <text x={PAD.left - 8} y={y(t) + 4} textAnchor='end'>
                                    ${compactNumber(t)}
                                </text>
                            </g>
                        ))}
                        {points.map((p, i) => {
                            const v = values[i];
                            const x = PAD.left + band * i + (band - barW) / 2;
                            const onlineH = h(v.online);
                            const posH = h(v.pos);
                            // The gap only appears when both segments exist.
                            const gap = onlineH > 0 && posH > 0 ? GAP : 0;
                            const dim = hover !== null && hover !== i;
                            return (
                                <g key={p.period} opacity={dim ? 0.55 : 1}>
                                    <path
                                        d={columnPath(x, y(v.online), barW, onlineH, posH === 0)}
                                        fill={SERIES.online}
                                    />
                                    <path
                                        d={columnPath(x, y(v.online + v.pos), barW, Math.max(0, posH - gap), true)}
                                        fill={SERIES.pos}
                                    />
                                    {i % labelEvery === 0 && (
                                        <text x={PAD.left + band * i + band / 2} y={HEIGHT - 8} textAnchor='middle'>
                                            {formatPeriod(p.period, interval)}
                                        </text>
                                    )}
                                    {/* Hit target: the whole band, taller than the mark */}
                                    <rect
                                        x={PAD.left + band * i}
                                        y={PAD.top}
                                        width={band}
                                        height={plotH}
                                        fill='transparent'
                                        data-testid='chart-band'
                                        onMouseEnter={() => setHover(i)}
                                        onFocus={() => setHover(i)}
                                        tabIndex={-1}
                                    />
                                </g>
                            );
                        })}
                        <line
                            x1={PAD.left}
                            x2={WIDTH - PAD.right}
                            y1={PAD.top + plotH}
                            y2={PAD.top + plotH}
                            stroke={GRID}
                            strokeWidth={1}
                        />
                    </svg>
                    {hovered && hover !== null && (
                        <StyledTooltip
                            role='tooltip'
                            style={{ left: `${((PAD.left + band * hover + band / 2) / WIDTH) * 100}%` }}
                        >
                            <strong>{formatPeriodLong(hovered.period, interval)}</strong>
                            <div>
                                <span className='key'>
                                    <span className='swatch' style={{ background: SERIES.online }} />
                                    En línea
                                </span>
                                <span>{formatMoney(hovered.online)}</span>
                            </div>
                            {(hasPos || Number(hovered.pos) > 0) && (
                                <div>
                                    <span className='key'>
                                        <span className='swatch' style={{ background: SERIES.pos }} />
                                        Mostrador
                                    </span>
                                    <span>{formatMoney(hovered.pos)}</span>
                                </div>
                            )}
                            <div>
                                <span>Total · {hovered.orders} pedido(s)</span>
                                <span>{formatMoney(hovered.total)}</span>
                            </div>
                        </StyledTooltip>
                    )}
                </StyledChart>
            )}
        </>
    );
};

export default SalesChart;
