import { Debt, DebtStatus } from '../../types';

export const calculateInterest = (debt: Debt): number => {
    // Se houver um valor fixo de juros definido, mostrar ele independente do status
    if (debt.interestAmount !== undefined && debt.interestAmount > 0) return debt.interestAmount;

    if (debt.status !== DebtStatus.OVERDUE) return 0;

    const rate = debt.interestRate !== undefined ? debt.interestRate : 0.30;
    return debt.amount * rate;
};
