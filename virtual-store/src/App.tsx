import { useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { useDispatch } from "react-redux";
import Header from "./components/Header";
import Theme from "./components/Theme";
import GlobalStyle from "./components/Theme/GlobalStyles";
import Cart from "./components/Cart";
import Products from "./components/Products";
import Home from "./components/Home";
import LoginPage from "./components/Auth";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { restoreSession } from "./components/Auth/authSlice";
import { Route, Routes } from "react-router-dom";
import SignUpPage from "./components/SignUp";
import ProfilePage from "./components/Profile";
import CheckOut from "./components/Checkout";
import OrdersPage from "./components/Orders";
import OrderDetail from "./components/Orders/OrderDetail";
import AddressesPage from "./components/Addresses";
import AnalyticsPage from "./components/Analytics";
import type { AppDispatch } from "./store/store";


function App() {
    const dispatch = useDispatch<AppDispatch>();

    // On load, turn the stored refresh token back into a session (no-op if there is none)
    useEffect(() => {
        dispatch(restoreSession());
    }, [dispatch]);

    return (
        <ThemeProvider theme={Theme}>
            <GlobalStyle />
            <Header appName='Virtual Store' />
            <main>
                <Routes>
                    {/* Public: preview of featured products */}
                    <Route path='/' element= {<Home />} />
                    <Route path='/login' element= {<LoginPage />} />
                    <Route path='/sign-up' element= { <SignUpPage />} />
                    {/* Routes that need a session */}
                    <Route element={<ProtectedRoute />}>
                        <Route path='/store' element= { <Products /> } />
                        <Route path='/checkout' element= { <CheckOut />} />
                        <Route path='/profile' element= { <ProfilePage />} />
                        <Route path='/addresses' element= { <AddressesPage />} />
                        <Route path='/orders' element= { <OrdersPage />} />
                        <Route path='/orders/:orderId' element= { <OrderDetail />} />
                    </Route>
                    {/* Staff only (M5): sales reports */}
                    <Route element={<ProtectedRoute requireStaff />}>
                        <Route path='/staff/analytics' element= { <AnalyticsPage /> } />
                    </Route>
                </Routes>
                <Cart />
            </main>
        </ThemeProvider>
    )
}

export default App;
