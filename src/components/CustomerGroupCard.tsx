import React, { useMemo } from 'react';
import { Debt, DebtStatus } from '../../types';
import { calculateInterest } from '../utils/finance';

interface CustomerGroupCardProps {
    customerName: string;
    customerCode: string;
    avatarColor: string;
    debts: Debt[];
    onClick: () => void;
}

const CustomerGroupCard: React.FC<CustomerGroupCardProps> = ({ customerName, customerCode, avatarColor, debts, onClick }) => {
    // CRITICAL: Show only principal debt, NEVER add interest
    const totalPrincipalDebt = debts.reduce((acc, d) => acc + d.amount, 0);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const overdueDebts = debts.filter(d => {
        if (d.status === DebtStatus.PAID) return false;
        if (!d.dueDate) return false;
        const dueDate = new Date(d.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate <= today;
    });

    const overdueCount = overdueDebts.length;
    const isDueToday = useMemo(() => {
        return overdueDebts.some(d => {
            if (!d.dueDate) return false;
            const [year, month, day] = d.dueDate.split('-').map(Number);
            const dueDate = new Date(year, month - 1, day);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
        });
    }, [overdueDebts, today]);

    // Calculate days overdue for the oldest overdue debt
    const daysOverdue = useMemo(() => {
        if (overdueDebts.length === 0) return 0;
        const oldestOverdue = overdueDebts.reduce((prev, curr) => {
            if (!prev.dueDate) return curr;
            if (!curr.dueDate) return prev;
            const [yPrev, mPrev, dPrev] = prev.dueDate.split('-').map(Number);
            const [yCurr, mCurr, dCurr] = curr.dueDate.split('-').map(Number);
            return new Date(yCurr, mCurr - 1, dCurr) < new Date(yPrev, mPrev - 1, dPrev) ? curr : prev;
        });
        if (!oldestOverdue || !oldestOverdue.dueDate) return 0;
        const [year, month, day] = oldestOverdue.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);
        return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    }, [overdueDebts, today]);

    const oldestDebtDate = useMemo(() => {
        if (debts.length === 0) return null;
        return debts.reduce((prev, curr) =>
            new Date(curr.dueDate) < new Date(prev.dueDate) ? curr : prev
        ).dueDate;
    }, [debts]);

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary/50 transition-all group flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    {customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{customerName}</h4>
                    <p className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                        Venc. Inicial: {oldestDebtDate ? new Date(oldestDebtDate).toLocaleDateString('pt-BR') : '-'}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-gray-900 dark:text-white">R$ {totalPrincipalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                    {overdueCount > 0 && (
                        <>
                            {daysOverdue > 0 ? (
                                <span className="text-[10px] font-black text-white bg-red-600 px-2 py-1 rounded flex items-center gap-1 animate-pulse shadow-sm">
                                    ⚠️ {daysOverdue} dia{daysOverdue !== 1 ? 's' : ''} vencido
                                </span>
                            ) : (
                                <span className="text-[10px] font-black text-white bg-amber-500 px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                    🔔 Vence HOJE
                                </span>
                            )}
                            <span className="text-[9px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded">{overdueCount} título{overdueCount !== 1 ? 's' : ''}</span>
                        </>
                    )}
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{debts.length} total</span>
                </div>
            </div>
        </button>
    );
};

export default CustomerGroupCard;
