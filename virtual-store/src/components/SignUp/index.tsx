import { useDispatch } from "react-redux";
import { FormContainer, Input } from "./styles";
import { AppDispatch } from "../../store/store";
import { useAppSelector } from "../Hooks/hooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StyledError } from "../Theme/components";
import { clearAuthError, registerUser } from "../Auth/authSlice";
import { selectAuthError, selectAuthStatus, selectIsAuthenticated } from "../Auth/authSelectors";
import { LOADING } from "../../store/status";

const SignUpPage = () => {
    // variable to navigate to one path by clicking a button
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const status = useAppSelector(selectAuthStatus);
    const serverError = useAppSelector(selectAuthError);
    const loading = status === LOADING;

    // Track inputs locally
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [formError, setFormError] = useState('');

    // Do not show an error left over from another page (e.g. a failed login)
    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    // The backend returns tokens on register, so a new customer is logged in and goes to the store
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/store', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target; // Use current form name field to get all fields with 1 instruction
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError('');

        // Validate password confirmation match before sending anything
        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match!');
            return;
        }

        // Only these three fields are sent. is_staff & co. are never part of a sign up.
        dispatch(registerUser({
            full_name: formData.full_name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
        }));
    }

    const error = formError || serverError;

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <Input
                    type='text'
                    name='full_name'
                    placeholder='full name'
                    aria-label='Full name'
                    autoComplete='name'
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={loading}
                />
                <Input
                    type='email'
                    name='email'
                    placeholder='email'
                    aria-label='Email'
                    autoComplete='email'
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                />
                <Input
                    type='password'
                    name='password'
                    placeholder='password'
                    aria-label='Password'
                    autoComplete='new-password'
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                />
                <Input
                    type='password'
                    name='confirmPassword'
                    placeholder='confirm password'
                    aria-label='Confirm password'
                    autoComplete='new-password'
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                />
                {error && <StyledError role='alert'>{error}</StyledError>}
                <button type='submit' disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
            </form>
        </FormContainer>
    )
};

export default SignUpPage;
