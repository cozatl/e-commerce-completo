/** Mirrors addresses.choices.MexicanState in Django (code, name). */
export const MEXICAN_STATES: ReadonlyArray<readonly [string, string]> = [
    ['AGU', 'Aguascalientes'], ['BCN', 'Baja California'], ['BCS', 'Baja California Sur'],
    ['CAM', 'Campeche'], ['CHP', 'Chiapas'], ['CHH', 'Chihuahua'], ['CMX', 'Ciudad de México'],
    ['COA', 'Coahuila'], ['COL', 'Colima'], ['DUR', 'Durango'], ['GUA', 'Guanajuato'],
    ['GRO', 'Guerrero'], ['HID', 'Hidalgo'], ['JAL', 'Jalisco'], ['MEX', 'Estado de México'],
    ['MIC', 'Michoacán'], ['MOR', 'Morelos'], ['NAY', 'Nayarit'], ['NLE', 'Nuevo León'],
    ['OAX', 'Oaxaca'], ['PUE', 'Puebla'], ['QUE', 'Querétaro'], ['ROO', 'Quintana Roo'],
    ['SLP', 'San Luis Potosí'], ['SIN', 'Sinaloa'], ['SON', 'Sonora'], ['TAB', 'Tabasco'],
    ['TAM', 'Tamaulipas'], ['TLA', 'Tlaxcala'], ['VER', 'Veracruz'], ['YUC', 'Yucatán'],
    ['ZAC', 'Zacatecas'],
];

/** Fields the customer types in (POST/PATCH /addresses/). */
export interface AddressInput {
    label: string;
    recipient_name: string;
    /** 10 digits. Spaces and dashes are stripped by the server. */
    phone: string;
    street: string;
    exterior_number: string;
    interior_number: string;
    /** Colonia */
    neighborhood: string;
    /** 5 digits */
    postal_code: string;
    /** Municipio / alcaldía */
    municipality: string;
    city: string;
    /** State code, see MEXICAN_STATES */
    state: string;
    references: string;
    is_default: boolean;
}

/** GET /addresses/ (addresses.AddressSerializer). */
export interface Address extends AddressInput {
    id: number;
    state_display: string;
    created_at: string;
    updated_at: string;
}

export const emptyAddress: AddressInput = {
    label: '',
    recipient_name: '',
    phone: '',
    street: '',
    exterior_number: '',
    interior_number: '',
    neighborhood: '',
    postal_code: '',
    municipality: '',
    city: '',
    state: '',
    references: '',
    is_default: false,
};

/** "Av. Juárez 10 int. 3B, Col. Centro, CP 01000, Cuauhtémoc, Ciudad de México" */
export const formatAddress = (a: Pick<Address, 'street' | 'exterior_number' | 'interior_number' | 'neighborhood' | 'postal_code' | 'municipality' | 'state_display'>) =>
    [
        `${a.street} ${a.exterior_number}${a.interior_number ? ` int. ${a.interior_number}` : ''}`,
        `Col. ${a.neighborhood}`,
        `CP ${a.postal_code}`,
        a.municipality,
        a.state_display,
    ].join(', ');
