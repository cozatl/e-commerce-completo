import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { useFetch } from '../../lib/useFetch';
import { StyledError } from '../Theme/components';
import type { ReportFilters, ReportMeta, SummaryReport, TimeseriesReport } from '../interfaces/analyticsParameters';
import { FILTER_KEYS, formatShortDate, toQuery } from './analyticsUtils';
import Filters from './Filters';
import KpiCards from './KpiCards';
import SalesChart from './SalesChart';
import { Breakdown, Categories, Commissions, Operations, TopProducts } from './Sections';
import { StyledCard, StyledDashboard, StyledGrid, StyledHeaderRow } from './styles';

const SCOPE_TEXT: Record<ReportMeta['scope']['level'], string> = {
    global: 'Todas las sucursales y canales',
    location: 'Tus sucursales asignadas',
    own: 'Tus ventas',
};

/**
 * /staff/analytics — sales reports for staff (online + counter sales together).
 * Filters live in the URL so a view can be bookmarked or shared with the team.
 * What each person sees is decided by the server (groups "Reportes: ...").
 */
const AnalyticsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const meta = useFetch<ReportMeta>('/analytics/meta/');

    const filters = useMemo<ReportFilters>(
        () =>
            Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams.get(k) ?? ''])) as unknown as ReportFilters,
        [searchParams]
    );
    const query = useMemo(() => toQuery(filters), [filters]);

    const ready = meta.data !== null;
    const summary = useFetch<SummaryReport>(ready ? '/analytics/summary/' : null, query);
    const series = useFetch<TimeseriesReport>(ready ? '/analytics/timeseries/' : null, query);

    const updateFilters = (changes: Partial<ReportFilters>) => {
        const next = { ...filters, ...changes };
        setSearchParams(toQuery(next) as Record<string, string>);
    };

    if (meta.error) {
        const forbidden = meta.error instanceof ApiError && meta.error.status === 403;
        return (
            <StyledDashboard>
                <h2>Reportes</h2>
                <StyledError role='alert'>
                    {forbidden
                        ? 'No tienes acceso a los reportes. Pide a un administrador que te agregue a un grupo "Reportes".'
                        : getErrorMessage(meta.error, 'No se pudieron cargar los reportes.')}
                </StyledError>
            </StyledDashboard>
        );
    }
    if (!meta.data) {
        return (
            <StyledDashboard>
                <h2>Reportes</h2>
                <p role='status'>Cargando reportes...</p>
            </StyledDashboard>
        );
    }

    const range = summary.data?.range;
    const reportError = summary.error ?? series.error;

    return (
        <StyledDashboard>
            <StyledHeaderRow>
                <h2>Reportes de ventas</h2>
                <span className='muted'>
                    {SCOPE_TEXT[meta.data.scope.level]}
                    {range && ` · ${formatShortDate(range.start)} – ${formatShortDate(range.end)}`}
                    {` · Horario ${meta.data.time_zone}`}
                </span>
            </StyledHeaderRow>

            <Filters meta={meta.data} filters={filters} onChange={updateFilters} />

            {reportError && (
                <StyledError role='alert'>{getErrorMessage(reportError, 'No se pudieron cargar los reportes.')}</StyledError>
            )}

            {summary.loading && !summary.data && <p role='status'>Cargando resumen...</p>}
            {summary.data && (
                <KpiCards
                    summary={summary.data}
                    showCommission={meta.data.scope.own || Number(summary.data.current.commission_total) > 0}
                />
            )}

            <StyledCard>{series.data ? <SalesChart report={series.data} /> : <p role='status'>Cargando gráfica...</p>}</StyledCard>

            {!reportError && (
                <StyledGrid>
                    <TopProducts query={query} />
                    <Categories query={query} />
                    <Breakdown query={query} />
                    <Operations query={query} />
                    <Commissions query={query} />
                </StyledGrid>
            )}
        </StyledDashboard>
    );
};

export default AnalyticsPage;
