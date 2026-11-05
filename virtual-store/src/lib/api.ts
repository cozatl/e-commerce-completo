import axios, { isCancel, type InternalAxiosRequestConfig } from 'axios';
import { config } from './config';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from './tokenStorage';

export type Query = Record<string, string | number | boolean | undefined | null>;

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(status: number, data: unknown, message?: string) {
        super(message ?? `API error ${status}`);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/** Single Axios instance for the whole app. */
export const http = axios.create({
    baseURL: config.apiUrl,
    headers: { Accept: 'application/json' },
    timeout: 15000,
});

// ---------------------------------------------------------------------------
// Auth plumbing. This file does not import Redux (no circular imports): the store
// plugs its access token and its session callbacks in from store.ts.
// ---------------------------------------------------------------------------
let getAccessToken: () => string | null = () => null;
export const setAccessTokenGetter = (getter: () => string | null) => {
    getAccessToken = getter;
};

interface SessionHandlers {
    /** A new access token was obtained through the refresh token. */
    onTokensRefreshed?: (access: string) => void;
    /** The refresh token was rejected: the session is over. */
    onSessionExpired?: () => void;
}
let sessionHandlers: SessionHandlers = {};
export const setSessionHandlers = (handlers: SessionHandlers) => {
    sessionHandlers = handlers;
};

// Endpoints that must never carry a Bearer token nor trigger a refresh:
// DRF validates the Authorization header even on public views, so a stale token
// would turn a plain login/register into a 401.
const AUTH_PATH = /^\/(token|register|logout)(\/|$)/;
const isAuthPath = (url?: string) => !!url && AUTH_PATH.test(url.split('?')[0]);

http.interceptors.request.use((request) => {
    if (isAuthPath(request.url)) return request;
    const token = getAccessToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
});

interface RefreshResponse {
    access: string;
    /** Present because the backend rotates refresh tokens. */
    refresh?: string;
}

// One refresh at a time: with rotation + blacklist a second parallel refresh with the
// same (already rotated) token would fail, so concurrent 401s share this promise.
let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
    if (refreshPromise) return refreshPromise;

    const refresh = getRefreshToken();
    if (!refresh) return Promise.reject(new ApiError(401, null, 'No refresh token'));

    refreshPromise = http
        .post<RefreshResponse>('/token/refresh', { refresh })
        .then(({ data }) => {
            if (data.refresh) setRefreshToken(data.refresh);
            sessionHandlers.onTokensRefreshed?.(data.access);
            return data.access;
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Every failed HTTP request reaches the app as an ApiError (status + parsed body).
// Cancelled requests (AbortController) are passed through untouched.
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (isCancel(error)) throw error;
        if (!axios.isAxiosError(error)) throw error;

        const original = error.config as RetriableConfig | undefined;
        const status = error.response?.status ?? 0;

        // Access token expired: refresh once and replay the original request.
        if (status === 401 && original && !original._retry && !isAuthPath(original.url) && getRefreshToken()) {
            original._retry = true;

            let access: string;
            try {
                access = await refreshAccessToken();
            } catch (refreshError) {
                // Only a rejected refresh token ends the session; a network error or a 5xx
                // while refreshing must not log the user out.
                if (refreshError instanceof ApiError && [400, 401].includes(refreshError.status)) {
                    clearRefreshToken();
                    sessionHandlers.onSessionExpired?.();
                }
                throw new ApiError(status, error.response?.data ?? null, error.message);
            }

            // Replay outside the try above: a 403/404/... from the replayed request is the
            // request's own error and must not be confused with a failed refresh.
            original.headers.set('Authorization', `Bearer ${access}`);
            return http(original);
        }

        throw new ApiError(status, error.response?.data ?? null, error.message);
    }
);

export { isCancel };

type RequestOptions = { signal?: AbortSignal };

export const api = {
    get: async <T>(path: string, query?: Query, options: RequestOptions = {}) =>
        (await http.get<T>(path, { params: query, signal: options.signal })).data,
    post: async <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
        (await http.post<T>(path, body, { signal: options.signal })).data,
    put: async <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
        (await http.put<T>(path, body, { signal: options.signal })).data,
    patch: async <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
        (await http.patch<T>(path, body, { signal: options.signal })).data,
    delete: async <T>(path: string, options: RequestOptions = {}) =>
        (await http.delete<T>(path, { signal: options.signal })).data,
};

/** DRF paginated response (count/next/previous/results). */
export interface Paginated<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
