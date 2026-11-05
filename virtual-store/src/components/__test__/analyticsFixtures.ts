import type {
    BreakdownReport,
    CategoriesReport,
    CommissionsReport,
    OperationsReport,
    ReportMeta,
    ReportRange,
    SummaryReport,
    TimeseriesReport,
    TopProductsReport,
} from '../interfaces/analyticsParameters';

export const range: ReportRange = {
    start: '2026-10-06',
    end: '2026-11-04',
    days: 30,
    channel: null,
    location: null,
    seller: null,
    interval: 'day',
};

export const meta: ReportMeta = {
    scope: { level: 'global', all: true, location_ids: [], own: false },
    locations: [
        { id: 1, name: 'Almacén en línea', region: 'En línea', kind: 'warehouse', is_active: true },
        { id: 2, name: 'Centro', region: 'Puebla', kind: 'store', is_active: true },
    ],
    channels: [
        { value: 'online', label: 'En línea' },
        { value: 'pos', label: 'Mostrador' },
    ],
    sellers: [
        { id: 7, name: 'Ana Vendedora', email: 'ana@example.com' },
        { id: 8, name: 'Luis', email: 'luis@example.com' },
    ],
    commission_base: 'net',
    commission_base_label: 'Productos sin IVA y sin envío',
    time_zone: 'America/Mexico_City',
    defaults: { start: '2026-10-06', end: '2026-11-04' },
};

const totals = {
    orders: 12,
    units: 30,
    sales_total: '15400.00',
    net_sales: '13275.86',
    items_total: '15000.00',
    shipping_total: '400.00',
    tax_total: '2124.14',
    average_ticket: '1283.33',
    commission_total: '320.00',
    refunds_count: 1,
    refunds_total: '580.00',
};

export const summary: SummaryReport = {
    range,
    previous_range: { start: '2026-09-06', end: '2026-10-05' },
    current: totals,
    previous: { ...totals, sales_total: '11000.00' },
    change: { sales_total: 40, net_sales: 40, orders: -7.7, units: 0, average_ticket: null },
};

export const timeseries: TimeseriesReport = {
    range: { ...range, start: '2026-11-02', days: 3 },
    interval: 'day',
    points: [
        { period: '2026-11-02', orders: 2, total: '1500.00', online: '1000.00', pos: '500.00' },
        { period: '2026-11-03', orders: 0, total: '0.00', online: '0.00', pos: '0.00' },
        { period: '2026-11-04', orders: 1, total: '800.00', online: '800.00', pos: '0.00' },
    ],
};

export const products: TopProductsReport = {
    range,
    order_by: 'revenue',
    results: [
        { product_id: 3, sku: 'LIC-1', name: 'Licencia Pro', product_type: 'software', units: 4, revenue: '8000.00', orders: 4 },
        { product_id: 5, sku: 'PLY-1', name: 'Playera', product_type: 'physical', units: 20, revenue: '4000.00', orders: 6 },
    ],
};

export const categories: CategoriesReport = {
    range,
    level: 'top',
    categories: [{ category_id: 1, name: 'Software', units: 4, revenue: '8000.00' }],
    product_types: [{ product_type: 'software', label: 'Software', units: 4, revenue: '8000.00' }],
};

export const breakdown: BreakdownReport = {
    range,
    channels: [
        { channel: 'online', label: 'En línea', orders: 9, total: '11000.00' },
        { channel: 'pos', label: 'Mostrador', orders: 3, total: '4400.00' },
    ],
    locations: [
        { location_id: 1, name: 'Almacén en línea', region: 'En línea', kind: 'warehouse', kind_label: 'Almacén en línea', orders: 9, total: '11000.00' },
        { location_id: 2, name: 'Centro', region: 'Puebla', kind: 'store', kind_label: 'Tienda física', orders: 3, total: '4400.00' },
    ],
    regions: [],
};

export const operations: OperationsReport = {
    range,
    created: 20,
    paid_rate: 65,
    statuses: [{ status: 'paid', label: 'Paid', count: 13, total: '15400.00' }],
    backlog: { awaiting_payment: 2, to_ship: 5, cancellation_requests: 1 },
};

export const commissions: CommissionsReport = {
    range,
    base: 'net',
    base_label: 'Productos sin IVA y sin envío',
    results: [
        { seller_id: 7, email: 'ana@example.com', name: 'Ana Vendedora', orders: 3, sales_total: '4400.00', commission: '320.00', current_percent: '10.00' },
    ],
    totals: { orders: 3, sales_total: '4400.00', commission: '320.00' },
};

/** Answer each /analytics/* endpoint with its fixture. */
export const analyticsRoutes: Record<string, unknown> = {
    '/analytics/meta/': meta,
    '/analytics/summary/': summary,
    '/analytics/timeseries/': timeseries,
    '/analytics/products/': products,
    '/analytics/categories/': categories,
    '/analytics/breakdown/': breakdown,
    '/analytics/operations/': operations,
    '/analytics/commissions/': commissions,
};
