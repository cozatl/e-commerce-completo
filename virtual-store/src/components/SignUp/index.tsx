import { useDispatch } from "react-redux";
import { Button, FormContainer, Input } from "./styles";
import { AppDispatch } from "../../store/store";
import { selectSignUpUser } from "./signUpSelectors";
import { useAppSelector } from "../Hooks/hooks";
import { addUsers } from "./signUpSlice";
import { useEffect, useState } from "react";
import { UserSignUp } from "../interfaces/signUpParameters";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
    // variable to navigate to one path by clicking a button
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const signUpUsers = useAppSelector(selectSignUpUser);

    useEffect(() => {
        console.log(signUpUsers);
    }, [signUpUsers]);

    // Track inputs locally
    const [formData, setFormData] = useState({
        name: '',
        user: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target; // Use current form name field to get all fields with 1 instruction
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Validate password confirmation match before dispatching
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Validate only unique users (using Redux data)
        const usernameClean = formData.user.trim().toLowerCase();
        const userExists = signUpUsers.some(u => u.user.toLowerCase() === usernameClean);

        if (userExists) {
            alert("User name is already registered.");
            return;
        }

        // Calculate max ID + 1
        const nextId = signUpUsers.length > 0 
            ? Math.max(...signUpUsers.map(u => u.id)) + 1 
            : 1; // If list is empty, fisrt Id will be 1

        // Send only required data to newUser
        const newUserRecord: UserSignUp = {
            id: nextId,
            name: formData.name,
            user: formData.user,
            password: formData.password
        };

        console.log("Data ready to be sent!");
        dispatch(addUsers(newUserRecord));        
        alert("User successfully added.");

        // Clean form
        setFormData({ name: '', user: '', password: '', confirmPassword: '' });

        navigate('/');
    }

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <Input
                    type='text'
                    name='name'
                    placeholder='name'
                    value={formData.name} 
                    onChange={handleChange} 
                />
                <Input
                    type='text'
                    name='user'
                    placeholder='user'
                    value={formData.user}
                    onChange={handleChange} 
                />
                <Input
                    type='password'
                    name='password'
                    placeholder='password'
                    value={formData.password}
                    onChange={handleChange}
                />
                <Input
                    type='password'
                    name='confirmPassword'
                    placeholder='confirm password'
                    value={formData.confirmPassword}
                    onChange={handleChange} 
                />
                <button type='submit'>Sign Up</button>
            </form>
        </FormContainer>
    )
};

export default SignUpPage;