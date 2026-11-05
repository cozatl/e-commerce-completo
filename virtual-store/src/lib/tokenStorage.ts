// The refresh token lives in localStorage so the session survives a page reload.
// The access token is never stored here: it only exists in memory (Redux).
//
// Known trade-off: any XSS can read localStorage. Mitigations in this template:
// short refresh lifetime (30 min), rotation + blacklist on the backend, and no
// dangerouslySetInnerHTML with user content. Future improvement: httpOnly cookie.
const REFRESH_KEY = 'vs.refresh';

// localStorage can throw (private mode, blocked site data), so every access is guarded.
export const getRefreshToken = (): string | null => {
    try {
        return localStorage.getItem(REFRESH_KEY);
    } catch {
        return null;
    }
};

export const setRefreshToken = (token: string): void => {
    try {
        localStorage.setItem(REFRESH_KEY, token);
    } catch {
        /* session simply will not survive a reload */
    }
};

export const clearRefreshToken = (): void => {
    try {
        localStorage.removeItem(REFRESH_KEY);
    } catch {
        /* nothing to clear */
    }
};
