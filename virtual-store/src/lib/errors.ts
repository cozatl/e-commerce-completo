import { ApiError } from './api';

const FALLBACK = 'Something went wrong. Please try again.';

/** Turns a DRF error body ({detail}, {field: [msgs]}, non_field_errors...) into one readable string. */
const flatten = (data: unknown): string => {
    if (typeof data === 'string') return data.trim().startsWith('<') ? '' : data; // skip HTML error pages
    if (Array.isArray(data)) return data.map(flatten).filter(Boolean).join(' ');
    if (data && typeof data === 'object') {
        const body = data as Record<string, unknown>;
        if (typeof body.detail === 'string') return body.detail;
        return Object.values(body).map(flatten).filter(Boolean).join(' ');
    }
    return '';
};

export const getErrorMessage = (err: unknown, fallback: string = FALLBACK): string => {
    if (err instanceof ApiError) {
        if (err.status === 0) return 'Cannot reach the server. Check your connection and try again.';
        return flatten(err.data) || fallback;
    }
    return fallback;
};
