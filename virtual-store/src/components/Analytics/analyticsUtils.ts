import type { Interval, ReportFilters } from '../interfaces/analyticsParameters';
import type { Query } from '../../lib/api';

export const FILTER_KEYS: (keyof ReportFilters)[] = ['start', 'end', 'channel', 'location', 'seller', 'interval'];

/** Only the filters that are set, ready for useFetch / axios params. */
export const toQuery = (filters: ReportFilters): Query =>
    Object.fromEntries(FILTER_KEYS.filter((k) => filters[k]).map((k) => [k, filters[k]]));

// ---------------------------------------------------------------------------
// Dates. The API works with local store dates ("YYYY-MM-DD"); build them without
// going through UTC so a date never shifts by one day.
// ---------------------------------------------------------------------------
const pad = (n: number) => String(n).padStart(2, '0');

export const parseDate = (iso: string): Date => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const toIso = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const addDays = (date: Date, days: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export interface Preset {
    id: string;
    label: string;
    range: (today: string) => { start: string; end: string };
}

/** Quick ranges, relative to the store's "today" (sent by /analytics/meta). */
export const PRESETS: Preset[] = [
    { id: '7d', label: '7 días', range: (t) => ({ start: toIso(addDays(parseDate(t), -6)), end: t }) },
    { id: '30d', label: '30 días', range: (t) => ({ start: toIso(addDays(parseDate(t), -29)), end: t }) },
    { id: '90d', label: '90 días', range: (t) => ({ start: toIso(addDays(parseDate(t), -89)), end: t }) },
    {
        id: 'month',
        label: 'Este mes',
        range: (t) => {
            const d = parseDate(t);
            return { start: toIso(new Date(d.getFullYear(), d.getMonth(), 1)), end: t };
        },
    },
    {
        id: 'last-month',
        label: 'Mes anterior',
        range: (t) => {
            const d = parseDate(t);
            return {
                start: toIso(new Date(d.getFullYear(), d.getMonth() - 1, 1)),
                end: toIso(new Date(d.getFullYear(), d.getMonth(), 0)),
            };
        },
    },
    {
        id: 'year',
        label: 'Este año',
        range: (t) => ({ start: `${t.slice(0, 4)}-01-01`, end: t }),
    },
];

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "2026-10-05" -> "5 oct" (day/week) or "oct 2026" (month). */
export const formatPeriod = (iso: string, interval: Interval): string => {
    const d = parseDate(iso);
    if (interval === 'month') return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** Tooltip / table label: weeks show their span. */
export const formatPeriodLong = (iso: string, interval: Interval): string => {
    if (interval === 'week') {
        const start = parseDate(iso);
        const end = addDays(start, 6);
        return `Semana del ${formatPeriod(iso, 'day')} al ${formatPeriod(toIso(end), 'day')}`;
    }
    return interval === 'month' ? formatPeriod(iso, 'month') : formatPeriod(iso, 'day');
};

export const formatShortDate = (iso: string): string => {
    const d = parseDate(iso);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** 1284 -> "1,284" · 12900 -> "12.9K" · 4200000 -> "4.2M" (axis ticks). */
export const compactNumber = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (abs >= 10_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return value.toLocaleString('es-MX', { maximumFractionDigits: 0 });
};

/** Clean axis ticks: 0 and 4 round steps that cover `max`. */
export const niceTicks = (max: number, count = 4): number[] => {
    if (max <= 0) return [0, 1];
    const rough = max / count;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
    const top = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
    return ticks;
};

export const formatPercent = (value: number | null | undefined): string =>
    value === null || value === undefined ? '—' : `${value.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`;
