import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../Hooks/hooks';
import { selectAuthInitialized, selectCurrentUser, selectIsAuthenticated } from './authSelectors';

interface ProtectedRouteProps {
    /** Only staff users may enter (admin areas). Regular customers go back to the store. */
    requireStaff?: boolean;
}

/**
 * Layout route: wraps the routes that need a session.
 *
 *   <Route element={<ProtectedRoute />}>
 *       <Route path='/checkout' element={<CheckOut />} />
 *   </Route>
 */
const ProtectedRoute = ({ requireStaff = false }: ProtectedRouteProps) => {
    const location = useLocation();
    const initialized = useAppSelector(selectAuthInitialized);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectCurrentUser);

    // The stored session is still being restored: do not bounce a logged-in user to the login page.
    if (!initialized) return <p role='status'>Loading...</p>;

    // Remember where the user was going so the login page can send them back there.
    if (!isAuthenticated) return <Navigate to='/login' replace state={{ from: location }} />;

    if (requireStaff && !user?.is_staff) return <Navigate to='/store' replace />;

    return <Outlet />;
};

export default ProtectedRoute;
