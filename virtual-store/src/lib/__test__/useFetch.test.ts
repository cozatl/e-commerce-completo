import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApiError } from '../api';
import { useFetch } from '../useFetch';
import { mockApi } from './mockAdapter';

describe('useFetch', () => {
    it('loads data and clears loading', async () => {
        mockApi(200, { results: [{ id: 1 }] });
        const { result } = renderHook(() => useFetch<{ results: { id: number }[] }>('/products/'));

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual({ results: [{ id: 1 }] });
        expect(result.current.error).toBeNull();
    });

    it('exposes the error when the request fails', async () => {
        mockApi(500, { detail: 'boom' });
        const { result } = renderHook(() => useFetch('/products/'));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeInstanceOf(ApiError);
        expect(result.current.data).toBeNull();
    });

    it('does not request anything when path is null', () => {
        const calls = mockApi(200, {});
        const { result } = renderHook(() => useFetch(null));

        expect(result.current.loading).toBe(false);
        expect(calls).toHaveLength(0);
    });

    it('cancels the request when the component unmounts', async () => {
        const calls = mockApi(200, {});
        const { unmount } = renderHook(() => useFetch('/products/'));

        await waitFor(() => expect(calls).toHaveLength(1));
        unmount();
        expect(calls[0].signal?.aborted).toBe(true);
    });

    it('requests again on refetch', async () => {
        const calls = mockApi(200, {});
        const { result } = renderHook(() => useFetch('/products/'));

        await waitFor(() => expect(result.current.loading).toBe(false));
        act(() => result.current.refetch());
        await waitFor(() => expect(calls).toHaveLength(2));
    });
});
