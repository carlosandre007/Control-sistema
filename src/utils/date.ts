/**
 * Formats a date to YYYY-MM-DD string safely.
 */
export const formatDateToISO = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/**
 * Calculates the same day in the next month, handling month-end overflows.
 * E.g., Jan 31 -> Feb 28/29.
 */
export const getNextMonthDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const current = new Date(year, month - 1, day);
    const next = new Date(year, month, day);

    // If the day changed differently than expected (e.g., month overflow)
    if (next.getDate() !== current.getDate()) {
        next.setDate(0); // Go to the last day of the intended month
    }

    return formatDateToISO(next);
};

/**
 * Parses a YYYY-MM-DD string into a Date object without timezone shifts.
 */
export const parseISODate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Formats a date for display in Portuguese (pt-BR).
 */
export const formatDisplayDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
};
