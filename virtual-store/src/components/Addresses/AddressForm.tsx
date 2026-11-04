import { useState } from 'react';
import { api } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { StyledError } from '../Theme/components';
import { StyledActions, StyledFormGrid } from '../Orders/styles';
import { MEXICAN_STATES, emptyAddress, type Address, type AddressInput } from '../interfaces/addressParameters';

interface AddressFormProps {
    /** Edit this address (PATCH); create a new one (POST) when missing. */
    address?: Address;
    onSaved: (address: Address) => void;
    onCancel?: () => void;
    submitLabel?: string;
}

type TextField = Exclude<keyof AddressInput, 'is_default' | 'state'>;

const FIELDS: { name: TextField; label: string; required?: boolean; wide?: boolean; autoComplete?: string; inputMode?: 'numeric' | 'tel' }[] = [
    { name: 'recipient_name', label: 'Recipient name', required: true, autoComplete: 'name' },
    { name: 'phone', label: 'Phone (10 digits)', required: true, autoComplete: 'tel', inputMode: 'tel' },
    { name: 'street', label: 'Street', required: true, wide: true, autoComplete: 'address-line1' },
    { name: 'exterior_number', label: 'Exterior number', required: true },
    { name: 'interior_number', label: 'Interior number' },
    { name: 'neighborhood', label: 'Colonia', required: true },
    { name: 'postal_code', label: 'Postal code', required: true, autoComplete: 'postal-code', inputMode: 'numeric' },
    { name: 'municipality', label: 'Municipio / alcaldía', required: true },
    { name: 'city', label: 'City' },
    { name: 'label', label: 'Label (e.g. Home, Office)' },
];

/** Create or edit an address. Validation messages come from the server. */
const AddressForm = ({ address, onSaved, onCancel, submitLabel }: AddressFormProps) => {
    // Keep only the editable fields (no id, timestamps...)
    const [values, setValues] = useState<AddressInput>(() =>
        address
            ? (Object.fromEntries(
                  (Object.keys(emptyAddress) as (keyof AddressInput)[]).map((key) => [key, address[key] ?? emptyAddress[key]]),
              ) as unknown as AddressInput)
            : emptyAddress,
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (name: keyof AddressInput, value: string | boolean) =>
        setValues((prev) => ({ ...prev, [name]: value }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const saved = address
                ? await api.patch<Address>(`/addresses/${address.id}/`, values)
                : await api.post<Address>('/addresses/', values);
            onSaved(saved);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not save the address.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} aria-label={address ? 'Edit address' : 'New address'}>
            <StyledFormGrid>
                {FIELDS.map((field) => (
                    <label key={field.name} className={field.wide ? 'wide' : undefined}>
                        {field.label}
                        <input
                            name={field.name}
                            value={values[field.name]}
                            required={field.required}
                            autoComplete={field.autoComplete}
                            inputMode={field.inputMode}
                            onChange={(e) => set(field.name, e.target.value)}
                            disabled={saving}
                        />
                    </label>
                ))}
                <label>
                    State
                    <select
                        name='state'
                        aria-label='State'
                        value={values.state}
                        required
                        onChange={(e) => set('state', e.target.value)}
                        disabled={saving}
                    >
                        <option value=''>Select a state</option>
                        {MEXICAN_STATES.map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                        ))}
                    </select>
                </label>
                <label className='wide'>
                    References
                    <textarea
                        name='references'
                        rows={2}
                        value={values.references}
                        onChange={(e) => set('references', e.target.value)}
                        disabled={saving}
                    />
                </label>
                <label className='wide' style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                        type='checkbox'
                        name='is_default'
                        checked={values.is_default}
                        onChange={(e) => set('is_default', e.target.checked)}
                        disabled={saving}
                        style={{ width: 'auto' }}
                    />
                    Use as my default address
                </label>
            </StyledFormGrid>
            {error && <StyledError role='alert'>{error}</StyledError>}
            <StyledActions style={{ marginTop: 10 }}>
                <button type='submit' disabled={saving}>
                    {saving ? 'Saving...' : submitLabel ?? 'Save address'}
                </button>
                {onCancel && (
                    <button type='button' onClick={onCancel} disabled={saving}>Cancel</button>
                )}
            </StyledActions>
        </form>
    );
};

export default AddressForm;
