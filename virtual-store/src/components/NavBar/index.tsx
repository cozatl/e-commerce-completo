
import { useDispatch } from 'react-redux';
import { selectIsAuthenticated } from '../Auth/authSelectors';
import { useAppSelector } from '../Hooks/hooks';
import { toggleMenu } from './navBarSlice';
import { NavLinks,  StyledNavLink } from './styles';
import { AppDispatch } from '../../store/store';
import { signOut } from '../Auth/authSlice';

const Navbar = () => {
    // Create dispatch to work with the store
    const dispatch = useDispatch<AppDispatch>();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const handleMenuToggle = (validateLogin: boolean) => {
        dispatch(toggleMenu());
        if (isAuthenticated && validateLogin){
            // Clears the session right away and blacklists the refresh token on the server
            dispatch(signOut());
        }
    };
    return (
        <NavLinks>
            <li>
                <StyledNavLink to={isAuthenticated ? '/' : '/login'}
                                onClick={() => handleMenuToggle(true)}
                >{!isAuthenticated ? 'Sign In' : 'Sign Out'}
                </StyledNavLink>
            </li>
            <li>
                <StyledNavLink to={isAuthenticated ? '/store' : '/'}
                                onClick={() => handleMenuToggle(false)}>Home</StyledNavLink>
            </li>
            {isAuthenticated && (
                <li>
                    <StyledNavLink to="/profile" onClick={() => handleMenuToggle(false)}>Profile</StyledNavLink>
                </li>
            )}
            {isAuthenticated && (
                <li>
                    <StyledNavLink to="/orders" onClick={() => handleMenuToggle(false)}>My orders</StyledNavLink>
                </li>
            )}
            {isAuthenticated && (
                <li>
                    <StyledNavLink to="/addresses" onClick={() => handleMenuToggle(false)}>Addresses</StyledNavLink>
                </li>
            )}
            <li>
                <StyledNavLink to="/about">About&nbsp;&nbsp;&nbsp;&#x25BC;</StyledNavLink>
                <ul>
                    <li><StyledNavLink to="/">About us</StyledNavLink></li>
                    <li><StyledNavLink to="/">Services</StyledNavLink></li>
                </ul>
            </li>
            {!isAuthenticated && (
                <li>
                    <StyledNavLink to="/sign-up">Sign up</StyledNavLink>
                </li>
            )}
        </NavLinks>
    );
};

export default Navbar;
