import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { http } from '../api';

export type MockReply = { status: number; data?: unknown };

/**
 * Replaces the Axios adapter so tests never touch the network.
 * `reply` decides the response for each request (so a test can answer 401 first and 200 later).
 * Returns the list of requests (config) that were made.
 */
export const mockApiRoutes = (reply: (config: InternalAxiosRequestConfig, index: number) => MockReply): InternalAxiosRequestConfig[] => {
    const calls: InternalAxiosRequestConfig[] = [];

    const adapter: AxiosAdapter = async (config) => {
        const { status, data } = reply(config, calls.length);
        calls.push(config);
        const response = { data, status, statusText: '', headers: {}, config };
        if (status >= 200 && status < 300) return response;
        throw new AxiosError(`Request failed with status ${status}`, AxiosError.ERR_BAD_REQUEST, config, null, response);
    };

    http.defaults.adapter = adapter;
    return calls;
};

/** Same response for every request. */
export const mockApi = (status: number, data: unknown): InternalAxiosRequestConfig[] =>
    mockApiRoutes(() => ({ status, data }));

/** Parsed JSON body of a recorded request. */
export const bodyOf = (config: InternalAxiosRequestConfig) => JSON.parse(config.data);
