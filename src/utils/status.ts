import { DebtStatus } from '../../types';

/**
 * Calculates the current status of a debt based on its due date and current status.
 * @param dueDate The due date of the debt (YYYY-MM-DD)
 * @param currentStatus The current status of the debt
 * @returns The calculated DebtStatus
 */
export const calculateDebtStatus = (dueDate: string, currentStatus: DebtStatus): DebtStatus => {
    if (currentStatus === DebtStatus.PAID) return DebtStatus.PAID;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);

    if (due <= today) {
        return DebtStatus.OVERDUE;
    }

    return DebtStatus.UP_TO_DATE;
};

/**
 * Checks if a debt is overdue.
 */
export const isOverdue = (dueDate: string): boolean => {
    if (!dueDate) return false;

    const parts = dueDate.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
        // Handle invalid date format, e.g., log an error or return false
        console.warn(`Invalid dueDate format for isOverdue: ${dueDate}`);
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = parts;
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);

    // Check if the parsed date is valid (e.g., new Date('invalid') results in Invalid Date)
    if (isNaN(due.getTime())) {
        console.warn(`Invalid date value for isOverdue after parsing: ${dueDate}`);
        return false;
    }

    return due <= today;
};

/**
 * Calculates the number of days a debt is overdue.
 */
export const calculateDaysOverdue = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
};
