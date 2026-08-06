import { images } from '../utils/images.ts';
import { StyledHeader, StyledMenu } from './styles.ts';
import React, {useEffect, useRef} from "react";
import Navbar from '../NavBar/index.tsx';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store.ts';
import { toggleCart } from '../Cart/cartSlice.ts';
import { useAppSelector } from '../Hooks/hooks.ts';
import { toggleMenu } from '../NavBar/navBarSlice.ts';
import { selectTotalQty } from '../Cart/cartSelectors.ts';
import { selectIsMenuOpen } from './headerSelectors.ts';
import { selectIsAuthenticated } from '../Auth/authSelectors.ts';

//When input parameter is a simple value (such as string) then we can create an interface
//then add it to the input parameter with "React.FC" or "const Header = ({appName}: HeaderProps)"
interface HeaderProps {
    appName: string;
}

const Header: React.FC<HeaderProps> = ({appName}) => {
    // Create dispatch to work with the store
    const dispatch = useDispatch<AppDispatch>();
    // useAppSelector is defined internally for typing variables and be used for typescript in all the project instead of useSelector
    // to skip typing " (state:RootState) => ... "
    const isMenuOpen = useAppSelector(selectIsMenuOpen); // new way instead of " state => state.menu.isMenuOpen " with manual selectors
    const totalQty = useAppSelector(selectTotalQty);  // Get totals in real time from custom selector
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isFirstRender = useRef(true);
    //Validate Webpage was loaded correctly
    useEffect(() => {
        !isFirstRender.current ? 
        console.log('Web Page loaded correctly.') : isFirstRender.current = false;
        
    }, []); // The empty array ensures the effect runs only on mount

    const handleMenuToggle = () => {
        dispatch(toggleMenu());
    };

    const handleCartToggle = () => {
        dispatch(toggleCart());
    };
    return (
        <StyledHeader>
            <i id='menu'><img src={images['menu.svg']} alt="Menu Icon" onClick={handleMenuToggle}/></i>
            {/* Pass the state down to the styled component */}
            <StyledMenu $isOpen={isMenuOpen}>
                <Navbar />
            </StyledMenu>
            <div>
                <h1>{appName}</h1>
                <img src={images['logo.png']} alt="Virtual Store Logo"/>
            </div>
            <div>
                <i id='cart'><img src={images['cart.jpg']} alt="Cart icon" onClick={handleCartToggle}/></i>
                <div id='cartCount'>{isAuthenticated ? totalQty : 0}</div>
            </div>
        </StyledHeader>
    )
}

export default Header;