import { useState } from 'react';
import { api } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { useFetch } from '../../lib/useFetch';
import { StyledError } from '../Theme/components';
import { StyledActions, StyledList, StyledPage, StyledPanel } from '../Orders/styles';
import { formatAddress, type Address } from '../interfaces/addressParameters';
import AddressForm from './AddressForm';

/** /addresses — the customer's delivery addresses (create, edit, delete, default). */
const AddressesPage = () => {
    const { data, loading, error, refetch } = useFetch<Address[]>('/addresses/');
    const [editing, setEditing] = useState<number | 'new' | null>(null);
    const [actionError, setActionError] = useState('');
    const [busyId, setBusyId] = useState<number | null>(null);

    const run = async (id: number, request: () => Promise<unknown>) => {
        setBusyId(id);
        setActionError('');
        try {
            await request();
            refetch();
        } catch (err) {
            setActionError(getErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const saved = () => {
        setEditing(null);
        refetch();
    };

    const addresses = data ?? [];

    return (
        <StyledPage>
            <h2>My addresses</h2>
            {loading && !data && <p role='status'>Loading addresses...</p>}
            {error && <StyledError role='alert'>{getErrorMessage(error, 'Could not load your addresses.')}</StyledError>}
            {actionError && <StyledError role='alert'>{actionError}</StyledError>}

            {data && addresses.length === 0 && editing !== 'new' && <p>You have no saved addresses yet.</p>}

            <StyledList>
                {addresses.map((address) => (
                    <li key={address.id} style={{ listStyle: 'none', marginBottom: 10 }}>
                        <StyledPanel>
                            {editing === address.id ? (
                                <AddressForm address={address} onSaved={saved} onCancel={() => setEditing(null)} />
                            ) : (
                                <>
                                    <h3>
                                        {address.label || address.recipient_name}
                                        {address.is_default && ' · Default'}
                                    </h3>
                                    <p style={{ margin: 0 }}>{address.recipient_name} · {address.phone}</p>
                                    <p style={{ margin: 0 }}>{formatAddress(address)}</p>
                                    <StyledActions>
                                        <button onClick={() => setEditing(address.id)} disabled={busyId === address.id}>Edit</button>
                                        {!address.is_default && (
                                            <button
                                                onClick={() => run(address.id, () => api.post(`/addresses/${address.id}/set-default/`))}
                                                disabled={busyId === address.id}
                                            >Make default</button>
                                        )}
                                        <button
                                            onClick={() => run(address.id, () => api.delete(`/addresses/${address.id}/`))}
                                            disabled={busyId === address.id}
                                        >Delete</button>
                                    </StyledActions>
                                </>
                            )}
                        </StyledPanel>
                    </li>
                ))}
            </StyledList>

            {editing === 'new' ? (
                <StyledPanel>
                    <h3>New address</h3>
                    <AddressForm onSaved={saved} onCancel={() => setEditing(null)} />
                </StyledPanel>
            ) : (
                <div><button onClick={() => setEditing('new')}>Add address</button></div>
            )}
        </StyledPage>
    );
};

export default AddressesPage;
