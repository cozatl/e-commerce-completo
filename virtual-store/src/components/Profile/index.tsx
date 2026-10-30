import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { LOADING } from "../../store/status";
import { useAppSelector } from "../Hooks/hooks";
import { FormContainer, Input } from "../SignUp/styles";
import { StyledError } from "../Theme/components";
import { clearAuthError, updateProfile } from "../Auth/authSlice";
import { selectAuthError, selectAuthStatus, selectCurrentUser } from "../Auth/authSelectors";
import type { ProfileUpdate } from "../interfaces/authParameters";
import { StyledSection, StyledSuccess } from "./styles";

const emptyPasswords = { current_password: '', password: '', confirmPassword: '' };

const ProfilePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useAppSelector(selectCurrentUser);
    const status = useAppSelector(selectAuthStatus);
    const serverError = useAppSelector(selectAuthError);
    const loading = status === LOADING;

    const [fullName, setFullName] = useState(user?.full_name ?? '');
    const [passwords, setPasswords] = useState(emptyPasswords);
    const [formError, setFormError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    // Keep the field in sync if the profile is (re)loaded after this page mounted
    useEffect(() => {
        setFullName(user?.full_name ?? '');
    }, [user?.full_name]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError('');
        setSaved(false);

        const changes: ProfileUpdate = { full_name: fullName.trim() };

        // Password section is optional; when used, the backend requires the current password
        const changingPassword = passwords.password !== '' || passwords.current_password !== '';
        if (changingPassword) {
            if (!passwords.current_password || !passwords.password) {
                setFormError('Enter your current password and the new one.');
                return;
            }
            if (passwords.password !== passwords.confirmPassword) {
                setFormError('Passwords do not match!');
                return;
            }
            changes.password = passwords.password;
            changes.current_password = passwords.current_password;
        }

        const result = await dispatch(updateProfile(changes));
        if (updateProfile.fulfilled.match(result)) {
            setPasswords(emptyPasswords);
            setSaved(true);
        }
    };

    if (!user) return null; // ProtectedRoute guarantees a user; this only narrows the type

    const error = formError || serverError;

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <StyledSection>
                    <legend>My profile</legend>
                    <label htmlFor='profileEmail'>Email</label>
                    <Input id='profileEmail' type='email' value={user.email} readOnly disabled />
                    <label htmlFor='profileName'>Full name</label>
                    <Input
                        id='profileName'
                        type='text'
                        name='full_name'
                        autoComplete='name'
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                    />
                </StyledSection>
                <StyledSection>
                    <legend>Change password (optional)</legend>
                    <Input
                        type='password'
                        name='current_password'
                        placeholder='current password'
                        aria-label='Current password'
                        autoComplete='current-password'
                        value={passwords.current_password}
                        onChange={handlePasswordChange}
                        disabled={loading}
                    />
                    <Input
                        type='password'
                        name='password'
                        placeholder='new password'
                        aria-label='New password'
                        autoComplete='new-password'
                        value={passwords.password}
                        onChange={handlePasswordChange}
                        disabled={loading}
                    />
                    <Input
                        type='password'
                        name='confirmPassword'
                        placeholder='confirm new password'
                        aria-label='Confirm new password'
                        autoComplete='new-password'
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                    />
                </StyledSection>
                {error && <StyledError role='alert'>{error}</StyledError>}
                {saved && !error && <StyledSuccess role='status'>Changes saved.</StyledSuccess>}
                <button type='submit' disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</button>
            </form>
        </FormContainer>
    );
};

export default ProfilePage;
