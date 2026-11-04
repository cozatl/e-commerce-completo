import { useState } from 'react';
import { StyledError } from '../Theme/components';
import { StyledActions, StyledFormGrid, StyledNotice } from './styles';
import type { PaymentOutcome } from '../interfaces/orderParameters';

/** Test card that simulates a declined payment (like the gateways' sandbox cards). */
export const DECLINED_TEST_CARD = '4000000000000002';

interface PaymentFormProps {
    total: string;
    paying: boolean;
    onPay: (outcome: PaymentOutcome) => void;
}

/**
 * SIMULATED payment form. The card data is only validated here and is NEVER sent to
 * the server: only the outcome is. When a real gateway is integrated, its own widget
 * (Stripe Elements, Mercado Pago Bricks...) replaces these inputs and tokenises the card.
 */
const PaymentForm = ({ total, paying, onPay }: PaymentFormProps) => {
    const [form, setForm] = useState({ name: '', card: '', cvv: '' });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const maxDigits: Record<string, number> = { card: 16, cvv: 3 };
        if (name in maxDigits) {
            const digits = value.replace(/\s/g, '');
            if (digits !== '' && !/^\d+$/.test(digits)) return;
            if (digits.length > maxDigits[name]) return;
            // Group the card number 4 by 4
            const formatted = name === 'card' ? digits.replace(/(\d{4})(?=\d)/g, '$1 ') : digits;
            setForm((prev) => ({ ...prev, [name]: formatted }));
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const card = form.card.replace(/\s/g, '');
        if (!form.name.trim()) return setError('Enter the name on the card.');
        if (card.length !== 16) return setError('The card number must have 16 digits.');
        if (form.cvv.length !== 3) return setError('The CVV must have 3 digits.');
        setError('');
        onPay(card === DECLINED_TEST_CARD ? 'declined' : 'approved');
    };

    return (
        <form onSubmit={handleSubmit} aria-label='Payment'>
            <StyledNotice>
                Simulated payment: no card data leaves your browser. Any 16 digits are approved;
                use 4000 0000 0000 0002 to simulate a declined card.
            </StyledNotice>
            <StyledFormGrid style={{ marginTop: 10 }}>
                <label className='wide'>
                    Name on card
                    <input name='name' autoComplete='cc-name' value={form.name} onChange={handleChange} disabled={paying} />
                </label>
                <label>
                    Card number
                    <input name='card' inputMode='numeric' autoComplete='cc-number' value={form.card} onChange={handleChange} disabled={paying} />
                </label>
                <label>
                    CVV
                    <input name='cvv' type='password' inputMode='numeric' autoComplete='cc-csc' value={form.cvv} onChange={handleChange} disabled={paying} />
                </label>
            </StyledFormGrid>
            {error && <StyledError role='alert'>{error}</StyledError>}
            <StyledActions style={{ marginTop: 10 }}>
                <button type='submit' disabled={paying}>{paying ? 'Processing...' : `Pay ${total}`}</button>
            </StyledActions>
        </form>
    );
};

export default PaymentForm;
