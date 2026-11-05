import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import Theme from '../Theme';
import AddressesPage from '../Addresses';
import { setAccessTokenGetter, setSessionHandlers } from '../../lib/api';
import { bodyOf, mockApiRoutes } from '../../lib/__test__/mockAdapter';
import { address, makeShopStore } from './orderFixtures';

const renderPage = () =>
    render(
        <ThemeProvider theme={Theme}>
            <MemoryRouter>
                <Provider store={makeShopStore()}>
                    <AddressesPage />
                </Provider>
            </MemoryRouter>
        </ThemeProvider>
    );

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('Addresses page', () => {
    it('creates an address and reloads the list', async () => {
        const user = userEvent.setup();
        let saved = false;
        const calls = mockApiRoutes((config) => {
            if (config.method === 'post') {
                saved = true;
                return { status: 201, data: address };
            }
            return { status: 200, data: saved ? [address] : [] };
        });
        renderPage();

        expect(await screen.findByText('You have no saved addresses yet.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Add address' }));

        await user.type(screen.getByLabelText('Recipient name'), 'Jesus Cozatl');
        await user.type(screen.getByLabelText('Phone (10 digits)'), '5512345678');
        await user.type(screen.getByLabelText('Street'), 'Av. Juárez');
        await user.type(screen.getByLabelText('Exterior number'), '10');
        await user.type(screen.getByLabelText('Colonia'), 'Centro');
        await user.type(screen.getByLabelText('Postal code'), '02000');
        await user.type(screen.getByLabelText('Municipio / alcaldía'), 'Cuauhtémoc');
        await user.selectOptions(screen.getByLabelText('State'), 'CMX');
        await user.click(screen.getByRole('button', { name: 'Save address' }));

        expect(await screen.findByText(/Av. Juárez 10, Col. Centro, CP 02000/)).toBeInTheDocument();
        const post = calls.find((c) => c.method === 'post')!;
        expect(post.url).toBe('/addresses/');
        expect(bodyOf(post)).toMatchObject({
            recipient_name: 'Jesus Cozatl',
            postal_code: '02000',
            state: 'CMX',
            is_default: false,
        });
    });

    it('shows validation errors from the server', async () => {
        const user = userEvent.setup();
        mockApiRoutes((config) =>
            config.method === 'post'
                ? { status: 400, data: { postal_code: ['The postal code must have exactly 5 digits.'] } }
                : { status: 200, data: [] }
        );
        renderPage();

        await user.click(await screen.findByRole('button', { name: 'Add address' }));
        // Required fields: fill the minimum so the browser lets the form submit
        for (const [label, value] of [
            ['Recipient name', 'J'], ['Phone (10 digits)', '5512345678'], ['Street', 'S'],
            ['Exterior number', '1'], ['Colonia', 'C'], ['Postal code', '123'], ['Municipio / alcaldía', 'M'],
        ]) {
            await user.type(screen.getByLabelText(label), value);
        }
        await user.selectOptions(screen.getByLabelText('State'), 'JAL');
        await user.click(screen.getByRole('button', { name: 'Save address' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('The postal code must have exactly 5 digits.');
    });

    it('marks another address as default', async () => {
        const user = userEvent.setup();
        const office = { ...address, id: 8, label: 'Oficina', is_default: false };
        const calls = mockApiRoutes(() => ({ status: 200, data: [address, office] }));
        renderPage();

        await user.click(await screen.findByRole('button', { name: 'Make default' }));
        expect(calls.some((c) => c.method === 'post' && c.url === '/addresses/8/set-default/')).toBe(true);
    });
});
