/** Shapes of the /analytics/* endpoints (M5). Money comes as "1234.56" strings. */

export type Channel = 'online' | 'pos';
export type Interval = 'day' | 'week' | 'month';

export interface ReportRange {
    start: string;
    end: string;
    days: number;
    channel: Channel | null;
    location: number | null;
    seller: number | null;
    interval: Interval;
}

export interface ReportLocation {
    id: number;
    name: string;
    region: string;
    kind: 'warehouse' | 'store';
    is_active: boolean;
}

export interface ReportMeta {
    scope: { level: 'global' | 'location' | 'own'; all: boolean; location_ids: number[]; own: boolean };
    locations: ReportLocation[];
    channels: { value: Channel; label: string }[];
    sellers: { id: number; name: string; email: string }[];
    commission_base: 'net' | 'total';
    commission_base_label: string;
    time_zone: string;
    defaults: { start: string; end: string };
}

export interface SummaryTotals {
    orders: number;
    units: number;
    sales_total: string;
    net_sales: string;
    items_total: string;
    shipping_total: string;
    tax_total: string;
    average_ticket: string;
    commission_total: string;
    refunds_count: number;
    refunds_total: string;
}

export type ChangeKey = 'sales_total' | 'net_sales' | 'orders' | 'units' | 'average_ticket';

export interface SummaryReport {
    range: ReportRange;
    previous_range: { start: string; end: string };
    current: SummaryTotals;
    previous: SummaryTotals;
    change: Record<ChangeKey, number | null>;
}

export interface TimeseriesPoint {
    period: string;
    orders: number;
    total: string;
    online: string;
    pos: string;
}

export interface TimeseriesReport {
    range: ReportRange;
    interval: Interval;
    points: TimeseriesPoint[];
}

export interface TopProduct {
    product_id: number | null;
    sku: string;
    name: string;
    product_type: string;
    units: number;
    revenue: string;
    orders: number;
}

export interface TopProductsReport {
    range: ReportRange;
    order_by: 'revenue' | 'units';
    results: TopProduct[];
}

export interface CategoriesReport {
    range: ReportRange;
    level: 'top' | 'leaf';
    categories: { category_id: number | null; name: string; units: number; revenue: string }[];
    product_types: { product_type: string; label: string; units: number; revenue: string }[];
}

export interface BreakdownRow {
    orders: number;
    total: string;
}

export interface BreakdownReport {
    range: ReportRange;
    channels: (BreakdownRow & { channel: Channel; label: string })[];
    locations: (BreakdownRow & { location_id: number | null; name: string; region: string; kind: string | null; kind_label: string })[];
    regions: (BreakdownRow & { region: string })[];
}

export interface OperationsReport {
    range: ReportRange;
    created: number;
    paid_rate: number | null;
    statuses: { status: string; label: string; count: number; total: string }[];
    backlog: { awaiting_payment: number; to_ship: number; cancellation_requests: number };
}

export interface CommissionRow {
    seller_id: number;
    email: string;
    name: string;
    orders: number;
    sales_total: string;
    commission: string;
    current_percent: string | null;
}

export interface CommissionsReport {
    range: ReportRange;
    base: 'net' | 'total';
    base_label: string;
    results: CommissionRow[];
    totals: { orders: number; sales_total: string; commission: string };
}

/** Filters kept in the URL (?start=&end=&channel=...). Empty string = not set. */
export interface ReportFilters {
    start: string;
    end: string;
    channel: string;
    location: string;
    seller: string;
    interval: string;
}
