import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Theme from '../Theme';
import AnalyticsPage from '../Analytics';
import ProtectedRoute from '../Auth/ProtectedRoute';
import Navbar from '../NavBar';
import { niceTicks, PRESETS, formatPeriodLong, toQuery } from '../Analytics/analyticsUtils';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { loggedIn, makeStore, profile } from './testStore';
import { analyticsRoutes } from './analyticsFixtures';

const staff = { ...profile, is_staff: true };

const renderPage = (path = '/staff/analytics', user = staff) =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter initialEntries={[path]}>
                <Provider store={makeStore(loggedIn(user))}>
                    <Routes>
                        <Route element={<ProtectedRoute requireStaff />}>
                            <Route path='/staff/analytics' element={<AnalyticsPage />} />
                        </Route>
                        <Route path='/store' element={<p>Store page</p>} />
                    </Routes>
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

/** Last section to load: the commissions table. */
const waitForReports = () => screen.findByRole('cell', { name: /Ana Vendedora/ });

const mockReports = () =>
    mockApiRoutes((config) => {
        const data = analyticsRoutes[config.url ?? ''];
        return data ? { status: 200, data } : { status: 404, data: { detail: 'Not found.' } };
    });

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('Analytics dashboard', () => {
    it('shows KPIs, chart and report sections', async () => {
        mockReports();
        renderPage();

        expect(await screen.findByText('Reportes de ventas')).toBeInTheDocument();
        expect((await screen.findAllByText('$15,400.00')).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/\+40%/)).toHaveLength(2); // sales with and without VAT
        expect(screen.getByText(/-7\.7%/)).toBeInTheDocument();
        expect(await screen.findByRole('img', { name: 'Gráfica de ventas por periodo' })).toBeInTheDocument();
        expect(await screen.findByText(/Licencia Pro/)).toBeInTheDocument();
        expect(await waitForReports()).toBeInTheDocument();
        // Backlog: 5 orders to ship
        const backlog = await screen.findByLabelText('Pendientes ahora');
        expect(within(backlog).getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Todas las sucursales y canales', { exact: false })).toBeInTheDocument();
    });

    it('sends the filters from the URL to every report', async () => {
        const calls = mockReports();
        renderPage('/staff/analytics?start=2026-10-01&end=2026-10-31&channel=pos&location=2');

        await waitForReports();
        const summaryCall = calls.find((c) => c.url === '/analytics/summary/')!;
        expect(summaryCall.params).toEqual({ start: '2026-10-01', end: '2026-10-31', channel: 'pos', location: '2' });
        const productsCall = calls.find((c) => c.url === '/analytics/products/')!;
        expect(productsCall.params).toMatchObject({ channel: 'pos', order_by: 'revenue', limit: 10 });
    });

    it('applies a preset and a seller filter', async () => {
        const user = userEvent.setup();
        const calls = mockReports();
        renderPage();
        await waitForReports();

        await user.click(screen.getByRole('button', { name: 'Mes anterior' }));
        await user.selectOptions(screen.getByLabelText('Vendedor'), '7');

        const last = [...calls].reverse().find((c) => c.url === '/analytics/summary/')!;
        expect(last.params).toEqual({ start: '2026-10-01', end: '2026-10-31', seller: '7' });
        expect(screen.getByRole('button', { name: 'Mes anterior' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows the chart as a table and a tooltip on hover', async () => {
        const user = userEvent.setup();
        mockReports();
        renderPage();
        await screen.findByRole('img', { name: 'Gráfica de ventas por periodo' });

        fireEvent.mouseEnter(screen.getAllByTestId('chart-band')[0]);
        const tooltip = screen.getByRole('tooltip');
        expect(within(tooltip).getByText('$500.00')).toBeInTheDocument();
        expect(within(tooltip).getByText('$1,500.00')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Ver tabla' }));
        expect(screen.getByRole('button', { name: 'Ver gráfica' })).toBeInTheDocument();
        expect(screen.queryByRole('img', { name: 'Gráfica de ventas por periodo' })).not.toBeInTheDocument();
        expect(screen.getByRole('cell', { name: '2 nov' })).toBeInTheDocument();
    });

    it('explains when the user has no report access', async () => {
        mockApiRoutes(() => ({ status: 403, data: { detail: 'You do not have permission to see reports.' } }));
        renderPage();
        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes acceso a los reportes');
    });

    it('sends customers back to the store', async () => {
        mockReports();
        renderPage('/staff/analytics', profile);
        expect(await screen.findByText('Store page')).toBeInTheDocument();
    });
});

describe('Navbar reports link', () => {
    const renderNav = (user = staff) =>
        render(
            <ThemeProvider theme={Theme}>
                <MemoryRouter>
                    <Provider store={makeStore(loggedIn(user))}>
                        <Navbar />
                    </Provider>
                </MemoryRouter>
            </ThemeProvider>
        );

    it('is visible for staff only', () => {
        const { unmount } = renderNav();
        expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute('href', '/staff/analytics');
        unmount();
        renderNav(profile);
        expect(screen.queryByRole('link', { name: 'Reports' })).not.toBeInTheDocument();
    });
});

describe('analytics utils', () => {
    it('builds clean axis ticks', () => {
        expect(niceTicks(1500)).toEqual([0, 500, 1000, 1500]);
        expect(niceTicks(0)).toEqual([0, 1]);
        expect(niceTicks(9_200)).toEqual([0, 2500, 5000, 7500, 10000]);
    });

    it('computes presets from the store date without shifting days', () => {
        const preset = (id: string) => PRESETS.find((p) => p.id === id)!;
        expect(preset('last-month').range('2026-03-15')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
        expect(preset('7d').range('2026-11-04')).toEqual({ start: '2026-10-29', end: '2026-11-04' });
        expect(preset('year').range('2026-11-04')).toEqual({ start: '2026-01-01', end: '2026-11-04' });
    });

    it('drops empty filters and labels weeks', () => {
        expect(toQuery({ start: '2026-10-01', end: '', channel: 'pos', location: '', seller: '', interval: '' })).toEqual({
            start: '2026-10-01',
            channel: 'pos',
        });
        expect(formatPeriodLong('2026-10-05', 'week')).toBe('Semana del 5 oct al 11 oct');
    });
});
