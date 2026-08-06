// 'use client'; // Required in the App Router for client-side hooks and avoids hydrated error

import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
import { StyledLoginFields, StyledLoginHeader, StyledMain } from './styles'
import { StyledButton, StyledError } from '../Theme/components'
// import api from '../lib/api'
// import { addUsers } from './authSlice';
import { AppDispatch } from '../../store/store';
import { useDispatch } from 'react-redux';
import { login } from './authSlice';
import { useAppSelector } from '../Hooks/hooks';
import { selectIsAuthenticated } from './authSelectors';
import { useNavigate } from 'react-router-dom';
import { selectSignUpUser } from '../SignUp/signUpSelectors';

const LoginPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const signUpUsers = useAppSelector(selectSignUpUser);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    // const mockedUsers = [{
    //         "id": 1,
    //         "user": "admin",
    //         "password": "admin"
    //     },
    //     {
    //         "id": 2,
    //         "user": "user",
    //         "password": "user"
    //     }
    // ]
    
    useEffect(() => {
        if(isAuthenticated) {
            navigate('/store', { replace: true });
        };
    }, [isAuthenticated, navigate]);

    const handleLogin = (user: string, password: string) => {
        // const value:string = e.target;
        // const exists = mockedUsers.some(user => user.name === name);
        const currentUser = signUpUsers.find((item) => item.user === user && item.password === password)
        // console.log(currentUser);
        if (currentUser) {
            dispatch(login(currentUser));
            console.log('user found')
            navigate('/store');
        }
        else {
            console.log('user not found');
            alert("User not found, please sign up first.");
        };
    }

    return (
        <StyledMain>
            <article>
                <StyledLoginHeader>
                    <p>Virtual Store</p>
                    <h1>Login</h1>
                </StyledLoginHeader>
                <StyledLoginFields>
                    <label htmlFor='userInput'>User</label>
                    <input
                        id='userInput'
                        type="text"
                        // value={fetchingUser ? 'Loading...' : userRetrieved}
                        onChange={e => setName(e.target.value)}
                        // disabled={fetchingUser}
                    />
                    <label htmlFor='passwordInput'>Password</label>
                    <input 
                        id='passwordInput'
                        type="password"
                        // value={fetchingUser ? 'Loading...' : userRetrieved}
                        onChange={e => setPassword(e.target.value)}
                        // disabled={fetchingUser}
                    />
                </StyledLoginFields>
                {/* Error */}
                {/* {(error || errorUsers) && (
                <StyledError>
                    {(error || errorUsers)}
                </StyledError>
                )} */}
                {/* Button */}
                <StyledButton
                    onClick={() => handleLogin(name, password)}
                    // disabled={loading || fetchingUser}
                >
                    {/* {loading || fetchingUser ? 'Validating...' : 'Log in'} */}
                    Log in
                </StyledButton>
            </article>
        </StyledMain>
    )
}
export default LoginPage;