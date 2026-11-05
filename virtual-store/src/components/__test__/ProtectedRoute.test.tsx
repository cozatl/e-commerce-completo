import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from '../Auth/ProtectedRoute';
import { loggedIn, makeStore, profile } from './testStore';

// Shows where a redirect to the login page came from
const Login = () => {
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    return <p>login page (from: {from ?? 'nowhere'})</p>;
};

const renderAt = (store: ReturnType<typeof makeStore>, path: string, requireStaff = false) =>
    render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    {/* /store is public here so the redirect of a non-staff user has somewhere to land */}
                    <Route path='/store' element={<p>store page</p>} />
                    <Route element={<ProtectedRoute requireStaff={requireStaff} />}>
                        <Route path='/checkout' element={<p>checkout page</p>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </Provider>
    );

describe('ProtectedRoute', () => {
    it('waits while the stored session is being restored (no redirect flash)', () => {
        renderAt(makeStore({ initialized: false }), '/checkout');

        expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
        expect(screen.queryByText(/login page/i)).not.toBeInTheDocument();
    });

    it('sends visitors to the login page remembering where they were going', () => {
        renderAt(makeStore({ initialized: true }), '/checkout');

        expect(screen.getByText('login page (from: /checkout)')).toBeInTheDocument();
        expect(screen.queryByText('checkout page')).not.toBeInTheDocument();
    });

    it('lets authenticated users in', () => {
        renderAt(makeStore(loggedIn()), '/checkout');

        expect(screen.getByText('checkout page')).toBeInTheDocument();
    });

    it('keeps customers out of staff-only routes and lets staff in', () => {
        const { unmount } = renderAt(makeStore(loggedIn()), '/checkout', true);
        expect(screen.getByText('store page')).toBeInTheDocument(); // redirected to /store
        unmount();

        renderAt(makeStore(loggedIn({ ...profile, is_staff: true })), '/checkout', true);
        expect(screen.getByText('checkout page')).toBeInTheDocument();
    });
});
