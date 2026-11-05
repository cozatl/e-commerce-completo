import { useCallback, useEffect, useState } from 'react';
import { api, isCancel, type Query } from './api';

export interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * GET helper for components. Runs the request inside useEffect, cancels it when the
 * component unmounts or when `path`/`params` change, and exposes loading/error state.
 *
 * Pass `null` as path to skip the request (e.g. until the user is logged in).
 *
 *   const { data, loading, error } = useFetch<Paginated<Product>>('/products/', { page });
 *   data?.results.map((p) => <ProductCard key={p.id} product={p} />)
 */
export function useFetch<T>(path: string | null, params?: Query): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(path !== null);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0);

    // Stable dependency: callers can pass a new params object on every render.
    const paramsKey = JSON.stringify(params ?? {});

    useEffect(() => {
        if (path === null) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        api.get<T>(path, JSON.parse(paramsKey) as Query, { signal: controller.signal })
            .then(setData)
            .catch((err) => {
                if (!isCancel(err)) setError(err);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [path, paramsKey, version]);

    const refetch = useCallback(() => setVersion((v) => v + 1), []);

    return { data, loading, error, refetch };
}
