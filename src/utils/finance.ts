import { Debt, DebtStatus } from '../../types';
import { supabase } from './supabase';
import { getNextMonthDate, formatDateToISO } from './date';
import { calculateDebtStatus } from './status';

export const calculateInterest = (debt: Debt): number => {
    // Se houver um valor fixo de juros definido, mostrar ele independente do status
    if (debt.interestAmount !== undefined && debt.interestAmount > 0) return debt.interestAmount;

    if (debt.status === DebtStatus.PAID) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(debt.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate > today) return 0;

    const rate = debt.interestRate !== undefined ? debt.interestRate : 0.30;
    return debt.amount * rate;
};

export const handleRecurrence = async (debt: Debt, userId: string) => {
    const nextDueDate = getNextMonthDate(debt.dueDate);

    const { data: originalDebt } = await supabase
        .from('debts')
        .select('amount')
        .eq('id', debt.id)
        .single();

    const nextDebt = {
        user_id: userId,
        customer_name: debt.customerName,
        customer_code: debt.customerCode,
        amount: debt.amount || 0, // Using latest amount as base for next cycle
        registration_date: formatDateToISO(new Date()),
        due_date: nextDueDate,
        status: DebtStatus.PENDING,
        is_recurring: true,
        avatar_color: debt.avatarColor,
        category: debt.category,
        whatsapp: debt.whatsapp,
        interest_rate: debt.interestRate || 0.30,
        description: debt.description
    };

    const { error } = await supabase.from('debts').insert([nextDebt]);
    if (error) {
        console.error('Error creating recurring debt:', error);
        throw error;
    }
};

export const registerPayment = async (
    debt: Debt,
    type: 'total' | 'interest',
    amount: number,
    userId: string
) => {
    // 1. Create Transaction (Immutable record)
    const transactionPayload = {
        user_id: userId,
        charge_id: debt.id,
        customer_name: debt.customerName,
        category: debt.category || 'Geral',
        type: type === 'total' ? 'total_payment' : 'interest_payment',
        amount: amount,
        transaction_date: formatDateToISO(new Date()),
        description: type === 'total' ? 'Pagamento Total' : 'Pagamento de Juros',
    };

    const { error: txError } = await supabase.from('transactions').insert([transactionPayload]);
    if (txError) throw txError;

    // 2. Update Billing (Debt)
    if (type === 'total') {
        const { error: debtError } = await supabase
            .from('debts')
            .update({
                status: DebtStatus.PAID,
                payment_date: new Date().toISOString(),
                amount: 0 // Zero principal on total payment
            })
            .eq('id', debt.id);
        if (debtError) throw debtError;
    } else if (type === 'interest') {
        // Renova a data de vencimento para o próximo mês ao pagar os juros
        const nextDueDate = getNextMonthDate(debt.dueDate);
        const { error: debtError } = await supabase
            .from('debts')
            .update({
                due_date: nextDueDate,
                // Mantém o status como PENDING ou calcula novo status baseado na data
                status: calculateDebtStatus(nextDueDate, debt.status)
            })
            .eq('id', debt.id);
        if (debtError) throw debtError;
    }
};
