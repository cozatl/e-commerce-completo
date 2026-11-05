import { useEffect, useState } from 'react'
import { StyledLoginFields, StyledLoginHeader, StyledMain } from './styles'
import { StyledButton, StyledError } from '../Theme/components'
import { AppDispatch } from '../../store/store';
import { useDispatch } from 'react-redux';
import { clearAuthError, loginUser } from './authSlice';
import { useAppSelector } from '../Hooks/hooks';
import { selectAuthError, selectAuthStatus, selectIsAuthenticated } from './authSelectors';
import { useLocation, useNavigate } from 'react-router-dom';
import { LOADING } from '../../store/status';

const LoginPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const status = useAppSelector(selectAuthStatus);
    const error = useAppSelector(selectAuthError);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const loading = status === LOADING;

    // ProtectedRoute sends the visitor here with the page they wanted in location.state.from
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/store';

    // Do not show an error left over from another page (e.g. a failed sign up)
    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.trim() || !password) return;
        // The backend logs in by email (case-insensitive)
        dispatch(loginUser({ email: email.trim().toLowerCase(), password }));
    }

    return (
        <StyledMain>
            <article>
                <StyledLoginHeader>
                    <p>Virtual Store</p>
                    <h1>Login</h1>
                </StyledLoginHeader>
                <form onSubmit={handleSubmit} noValidate>
                    <StyledLoginFields>
                        <label htmlFor='emailInput'>Email</label>
                        <input
                            id='emailInput'
                            type="email"
                            autoComplete='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <label htmlFor='passwordInput'>Password</label>
                        <input
                            id='passwordInput'
                            type="password"
                            autoComplete='current-password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </StyledLoginFields>
                    {error && <StyledError role='alert'>{error}</StyledError>}
                    <StyledButton type='submit' disabled={loading}>
                        {loading ? 'Validating...' : 'Log in'}
                    </StyledButton>
                </form>
            </article>
        </StyledMain>
    )
}
export default LoginPage;
