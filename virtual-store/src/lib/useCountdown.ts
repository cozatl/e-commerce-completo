import { useEffect, useState } from 'react';

/**
 * Counts down from `seconds` (as sent by the server, so the browser clock does not
 * matter) once per second. Returns null when there is nothing to count.
 * A new `seconds` value (e.g. after a refetch) restarts the countdown right away,
 * in the same render (no frame showing the previous value or nothing).
 */
export function useCountdown(seconds: number | null): number | null {
    const [state, setState] = useState({ base: seconds, left: seconds });

    // New starting value: adopt it during render (React's "adjust state on prop change").
    if (state.base !== seconds) setState({ base: seconds, left: seconds });

    useEffect(() => {
        if (seconds === null || seconds <= 0) return;

        const started = Date.now();
        const id = setInterval(() => {
            const left = Math.max(seconds - Math.floor((Date.now() - started) / 1000), 0);
            setState({ base: seconds, left });
            if (left === 0) clearInterval(id);
        }, 1000);
        return () => clearInterval(id);
    }, [seconds]);

    return state.base === seconds ? state.left : seconds;
}
