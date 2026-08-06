import { ThemeProvider } from "styled-components";
import Header from "./components/Header";
import Theme from "./components/Theme";
import GlobalStyle from "./components/Theme/GlobalStyles";
import Cart from "./components/Cart";
import Products from "./components/Products";
import LoginPage from "./components/Auth";
import { Navigate, Route, Routes } from "react-router-dom";
import { selectIsAuthenticated } from "./components/Auth/authSelectors";
import { useAppSelector } from "./components/Hooks/hooks";
import SignUpPage from "./components/SignUp";
import CheckOut from "./components/Checkout";
// import { Route, Routes } from "react-router-dom";


function App() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    return (
        <ThemeProvider theme={Theme}>
            <GlobalStyle />
            <Header appName='Virtual Store' />
            <main>
                <Routes>
                    <Route path='/' element= {<LoginPage />} />
                    <Route path='/store'
                        element= {
                            isAuthenticated 
                            ? <Products />
                            : <Navigate to ='/' replace />
                        }
                    />
                    <Route path='/sign-up'
                        element= { <SignUpPage />}
                    />
                    <Route path='/checkout'
                        element= { <CheckOut />}
                    />
                </Routes>
                <Cart />
            </main>
        </ThemeProvider>
    )
}

export default App;