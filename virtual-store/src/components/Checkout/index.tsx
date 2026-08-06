import { useDispatch } from "react-redux";
import { FormContainer, Input, StyledDivComplete, StyledDivProducts, StyledDivTotal } from "./styles";
import { AppDispatch } from "../../store/store";
import { useAppSelector } from "../Hooks/hooks";
import { useEffect, useState } from "react";
import { selectCartItems, selectTotalPrice, selectTotalQty } from "../Cart/cartSelectors";
import { StyledCartItem } from "../Cart/styles";
import { clearCart } from "../Cart/cartSlice";
import { selectIsEnabledCheckout, selectPurchaseComplete } from "./checkoutSelectors";
import { setCheckout, setComplete } from "./checkoutSlice";
import { useNavigate } from "react-router-dom";

const CheckOut = () => {
    // variable to navigate to one path by clicking a button
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const cartItems = useAppSelector(selectCartItems);
    const totalQty = useAppSelector(selectTotalQty);
    const totalPrice = useAppSelector(selectTotalPrice);
    const isEnabledCheckout = useAppSelector(selectIsEnabledCheckout);
    const purchaseComplete = useAppSelector(selectPurchaseComplete);
    useEffect(() => {
        console.log('checkout',isEnabledCheckout);console.log('qty',totalQty);
    }, [isEnabledCheckout]);

    // Track inputs locally
    const [formCard, setFormCard] = useState({
        name: '',
        card: '',
        cvv: '',
        address: '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target; // Use current form name field to get all fields with 1 instruction

        // 1. Rule dictionary: Define what fields are only numeric and get max length
        const fieldRules: Record<string, { maxDigits: number }> = {
            cvv: { maxDigits: 3 },          // Tu campo de 3 dígitos (ej. código de seguridad)
            card: { maxDigits: 16 } // Tu campo de 16 dígitos (ej. número de tarjeta)
        };

        if (name in fieldRules) {
            const { maxDigits } = fieldRules[name];
            
            // 1. Remove all existent spaces to evaluate only numbers
            const onlyDigits = value.replace(/\s/g, '');

            // 2. Block field if it contains letters or non-numeric characters
            if (onlyDigits !== '' && !/^\d+$/.test(onlyDigits)) {
                return;
            }

            // 3. Block field if it exceed allowed digits
            if (onlyDigits.length > maxDigits) {
                return;
            }

            // 4. Apply visual format if field is card number
            if (name === 'card') {
                // Group digits 4 by 4 split by spaces
                const formattedValue = onlyDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
                
                setFormCard((prevData) => ({ ...prevData, [name]: formattedValue }));
                return;
            }
        }

        setFormCard((prevData) => ({
            ...prevData,
            [name]: value,
        }));        
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Extract values by cleaning spaces from card number
        const card = formCard.card.replace(/\s/g, '');
        const cvv = formCard.cvv;
        const name = formCard.name?.trim() || '';

        // Validate empty or incomplete fields
        if (!name) {
            alert('Please insert a user name.');
            return;
        }

        if (card.length !== 16) {
            alert('Card Number must have 16 digits exactly.');
            return;
        }

        if (cvv.length !== 3) {
            alert('CVV Code must have 3 digits exactly.');
            return;
        }

        dispatch(setCheckout(true));
        alert('All data was successfully stored!');
    };

    const handleCheckout = () => {
        dispatch(clearCart());
        dispatch(setCheckout(false));
        dispatch(setComplete(true));
    };

    const handleComplete = () => {
        dispatch(setComplete(false));
        navigate('/');
    };

    const renderCheckout = () => (
        <>
            <FormContainer>
                <form onSubmit={handleSubmit}>
                    <Input
                        type='text'
                        name='name'
                        placeholder='your name'
                        value={formCard.name} 
                        onChange={handleChange} 
                    />
                    <Input
                        type='text'
                        name='card'
                        placeholder='card number'
                        value={formCard.card}
                        onChange={handleChange} 
                    />
                    <Input
                        type='password'
                        name='cvv'
                        placeholder='cvv'
                        value={formCard.cvv}
                        maxLength={3}
                        onChange={handleChange}
                    />
                    <Input
                        type='text'
                        name='address'
                        placeholder='address'
                        value={formCard.address}
                        onChange={handleChange} 
                    />
                    <button type='submit'>Save card</button>
                </form>
            </FormContainer>
            <StyledDivProducts>
                {cartItems.map(cart => (
                    <StyledCartItem key={cart.id}>
                        <img alt={`${cart.name}`} src={`${cart.img}`} />
                        <p>{`${cart.name}`}</p>
                        <p>$ {`${cart.price}`}</p>
                    </StyledCartItem>
                    )
                )}
                <StyledDivTotal>
                    <p>Total Products:   {totalQty}</p>
                    <p>Total Amount:    ${totalPrice}</p>
                </StyledDivTotal>
                <button type='submit'
                        onClick={handleCheckout}
                        disabled={ !isEnabledCheckout || totalQty <=0 }>Purchase
                </button>
            </StyledDivProducts>
        </>
    )
    const renderContent = () => {
        if (purchaseComplete) {
            return  <StyledDivComplete>
                        <p>Your purchase is complete</p>
                        <button type='submit'
                            onClick={handleComplete}
                            disabled={ false }>Go Home
                        </button>
                    </StyledDivComplete>
        }
        return renderCheckout();
    }
    return (
        <>            
            {
                renderContent()
            }
        </>
    )
};

export default CheckOut;
