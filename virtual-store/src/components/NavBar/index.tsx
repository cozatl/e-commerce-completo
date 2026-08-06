
import { useDispatch } from 'react-redux';
import { selectIsAuthenticated } from '../Auth/authSelectors';
import { useAppSelector } from '../Hooks/hooks';
import { toggleMenu } from './navBarSlice';
import { NavLinks,  StyledNavLink } from './styles';
import { AppDispatch } from '../../store/store';
import { logout } from '../Auth/authSlice';

const Navbar = () => {
    // Create dispatch to work with the store
    const dispatch = useDispatch<AppDispatch>();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const handleMenuToggle = (validateLogin: boolean) => {
        dispatch(toggleMenu());
        if (isAuthenticated && validateLogin){
            dispatch(logout());
        }
    };
    return (
        <NavLinks>
            <li>
                <StyledNavLink to={isAuthenticated ? '/store' : '/'}
                                onClick={() => handleMenuToggle(true)}
                >{!isAuthenticated ? 'Sign In' : 'Sign Out'}
                </StyledNavLink>
            </li>
            <li>
                <StyledNavLink to={isAuthenticated ? '/store' : '/'}
                                onClick={() => handleMenuToggle(false)}>Home</StyledNavLink>
            </li>
            <li>
                <StyledNavLink to="/about">About&nbsp;&nbsp;&nbsp;&#x25BC;</StyledNavLink>
                <ul>
                    <li><StyledNavLink to="/">About us</StyledNavLink></li>
                    <li><StyledNavLink to="/">Services</StyledNavLink></li>
                </ul> 
            </li>
            <li>
                <StyledNavLink to="/sign-up">Sign up</StyledNavLink>
            </li>
        </NavLinks>
    );
};

export default Navbar;