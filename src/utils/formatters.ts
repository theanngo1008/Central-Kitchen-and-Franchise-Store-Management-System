// Shared formatting utilities

/**
 * Format ISO date string to Vietnamese locale format
 * Example: "2026-02-03T19:57:08.497005+00:00" -> "03/02/2026, 02:57"
 */
export const formatDateTime = (isoString: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return isoString;
    }
};

/**
 * Format number to Vietnamese currency (VND)
 * Example: 35000 -> "35.000 ₫"
 */
export const formatCurrency = (amount: number): string => {
    // If amount is small (e.g. 0.06 VND), we should show decimals to avoid rounding to 0
    const fractionDigits = (amount > 0 && amount < 1) ? 3 : (amount % 1 !== 0 ? 2 : 0);
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: 4,
    }).format(amount);
};

/**
 * Format date only (no time)
 * Example: "2026-02-03T19:57:08.497005+00:00" -> "03/02/2026"
 */
export const formatDate = (isoString: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch {
        return isoString;
    }
};
