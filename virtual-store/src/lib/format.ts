/** "1250.5" -> "$1,250.50" (the API sends decimals as strings). */
export const formatMoney = (value: string | number | null | undefined): string => {
    const amount = Number(value ?? 0);
    return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** "0.1600" -> "16%" */
export const formatRate = (rate: string): string => `${Math.round(Number(rate) * 100)}%`;

/** ISO date -> "03/11/2026 12:04" in the browser's time zone. */
export const formatDateTime = (iso: string | null | undefined): string => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/** 125 -> "2:05" */
export const formatCountdown = (seconds: number): string => {
    const s = Math.max(0, Math.floor(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
