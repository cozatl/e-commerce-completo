import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, http, setAccessTokenGetter, setSessionHandlers } from '../api';
import { getRefreshToken, setRefreshToken } from '../tokenStorage';
import { getErrorMessage } from '../errors';
import { bodyOf, mockApi, mockApiRoutes } from './mockAdapter';

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    setAccessTokenGetter(() => null);
    setSessionHandlers({});
});

describe('api client (Axios)', () => {
    it('builds the URL with query params and skips empty ones', async () => {
        const calls = mockApi(200, { results: [] });
        await api.get('/products/', { page: 2, search: undefined });
        expect(http.getUri(calls[0])).toBe('/api/v1/products/?page=2');
    });

    it('sends the bearer token when available', async () => {
        const calls = mockApi(200, {});
        setAccessTokenGetter(() => 'abc');
        await api.get('/profile');
        expect(calls[0].headers.get('Authorization')).toBe('Bearer abc');
    });

    it('does not send Authorization without a token', async () => {
        const calls = mockApi(200, {});
        await api.get('/products/');
        expect(calls[0].headers.get('Authorization')).toBeFalsy();
    });

    it('never sends the bearer token to the public auth endpoints', async () => {
        const calls = mockApi(200, {});
        setAccessTokenGetter(() => 'expired');
        await api.post('/token', { email: 'a@b.com', password: 'x' });
        await api.post('/register', { email: 'a@b.com' });
        await api.post('/logout', { refresh: 'r' });
        expect(calls.map((c) => c.headers.get('Authorization'))).toEqual([undefined, undefined, undefined]);
    });

    it('sends JSON bodies on POST', async () => {
        const calls = mockApi(201, { id: 1 });
        await api.post('/users/', { email: 'a@b.com' });
        expect(JSON.parse(calls[0].data)).toEqual({ email: 'a@b.com' });
    });

    it('throws ApiError with status and data on failures', async () => {
        mockApi(401, { detail: 'nope' });
        await expect(api.get('/profile')).rejects.toMatchObject({ status: 401, data: { detail: 'nope' } });
        await expect(api.get('/profile')).rejects.toBeInstanceOf(ApiError);
    });

    it('handles 204 without a body', async () => {
        mockApi(204, undefined);
        await expect(api.delete('/carts/1/')).resolves.toBeUndefined();
    });
});

describe('token refresh', () => {
    it('refreshes once on 401, stores the rotated refresh token and replays the request', async () => {
        setRefreshToken('r1');
        let access = 'old';
        setAccessTokenGetter(() => access);
        const onTokensRefreshed = vi.fn((token: string) => {
            access = token;
        });
        setSessionHandlers({ onTokensRefreshed });

        const calls = mockApiRoutes((config) => {
            if (config.url === '/token/refresh') return { status: 200, data: { access: 'new', refresh: 'r2' } };
            // /profile fails with the old token and works with the new one
            return config.headers.get('Authorization') === 'Bearer new'
                ? { status: 200, data: { email: 'a@b.com' } }
                : { status: 401, data: { code: 'token_not_valid' } };
        });

        await expect(api.get('/profile')).resolves.toEqual({ email: 'a@b.com' });

        expect(calls.map((c) => c.url)).toEqual(['/profile', '/token/refresh', '/profile']);
        expect(bodyOf(calls[1])).toEqual({ refresh: 'r1' });
        expect(getRefreshToken()).toBe('r2'); // rotation: the old one is now blacklisted
        expect(onTokensRefreshed).toHaveBeenCalledWith('new');
    });

    it('shares a single refresh between simultaneous 401s', async () => {
        setRefreshToken('r1');
        let access = 'old';
        setAccessTokenGetter(() => access);
        setSessionHandlers({ onTokensRefreshed: (token) => { access = token; } });

        const calls = mockApiRoutes((config) => {
            if (config.url === '/token/refresh') return { status: 200, data: { access: 'new', refresh: 'r2' } };
            return config.headers.get('Authorization') === 'Bearer new' ? { status: 200, data: {} } : { status: 401 };
        });

        await Promise.all([api.get('/profile'), api.get('/carts/'), api.get('/orders/')]);

        expect(calls.filter((c) => c.url === '/token/refresh')).toHaveLength(1);
    });

    it('ends the session when the refresh token is rejected', async () => {
        setRefreshToken('dead');
        const onSessionExpired = vi.fn();
        setSessionHandlers({ onSessionExpired });
        mockApiRoutes(() => ({ status: 401, data: { code: 'token_not_valid' } }));

        await expect(api.get('/profile')).rejects.toMatchObject({ status: 401 });

        expect(onSessionExpired).toHaveBeenCalledTimes(1);
        expect(getRefreshToken()).toBeNull();
    });

    it('keeps the session if the refresh fails for a non-auth reason (server down)', async () => {
        setRefreshToken('r1');
        const onSessionExpired = vi.fn();
        setSessionHandlers({ onSessionExpired });
        mockApiRoutes((config) => (config.url === '/token/refresh' ? { status: 503 } : { status: 401 }));

        await expect(api.get('/profile')).rejects.toBeInstanceOf(ApiError);

        expect(onSessionExpired).not.toHaveBeenCalled();
        expect(getRefreshToken()).toBe('r1');
    });

    it('does not log the user out when the replayed request fails with 403', async () => {
        setRefreshToken('r1');
        const onSessionExpired = vi.fn();
        setSessionHandlers({ onSessionExpired });
        mockApiRoutes((config) => {
            if (config.url === '/token/refresh') return { status: 200, data: { access: 'new', refresh: 'r2' } };
            return config.headers.get('Authorization') === 'Bearer new' ? { status: 403, data: { detail: 'nope' } } : { status: 401 };
        });

        await expect(api.get('/users/')).rejects.toMatchObject({ status: 403 });

        expect(onSessionExpired).not.toHaveBeenCalled();
    });

    it('does not try to refresh when there is no refresh token', async () => {
        const calls = mockApi(401, { detail: 'nope' });
        await expect(api.get('/profile')).rejects.toMatchObject({ status: 401 });
        expect(calls).toHaveLength(1);
    });

    it('does not try to refresh when a login fails with 401', async () => {
        setRefreshToken('r1');
        const calls = mockApi(401, { detail: 'No active account found with the given credentials' });
        await expect(api.post('/token', { email: 'a@b.com', password: 'bad' })).rejects.toMatchObject({ status: 401 });
        expect(calls).toHaveLength(1);
    });
});

describe('getErrorMessage', () => {
    it('reads DRF detail and field errors', () => {
        expect(getErrorMessage(new ApiError(401, { detail: 'Bad credentials' }))).toBe('Bad credentials');
        expect(getErrorMessage(new ApiError(400, { email: ['Already exists.'], password: ['Too short.', 'Too common.'] }))).toBe(
            'Already exists. Too short. Too common.'
        );
    });

    it('falls back for network errors and HTML error pages', () => {
        expect(getErrorMessage(new ApiError(0, null))).toMatch(/cannot reach the server/i);
        expect(getErrorMessage(new ApiError(500, '<html>boom</html>'), 'Fallback')).toBe('Fallback');
        expect(getErrorMessage(new Error('x'), 'Fallback')).toBe('Fallback');
    });
});
