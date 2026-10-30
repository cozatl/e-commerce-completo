export type SiteProfile = 'store' | 'video' | 'books';

const profile = import.meta.env.VITE_SITE_PROFILE;

export const config = {
    // Same code base for several sites: store (physical/purchase), video, books
    siteProfile: (profile === 'video' || profile === 'books' ? profile : 'store') as SiteProfile,
    apiUrl: (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, ''),
};

/** Images/files uploaded to Django come as relative paths (/media/...). */
export const mediaUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return path.startsWith('/') ? path : `/${path}`;
};
