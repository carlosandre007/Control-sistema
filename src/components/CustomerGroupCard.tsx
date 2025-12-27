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
    const totalAmount = debts.reduce((acc, d) => acc + d.amount + calculateInterest(d), 0);
    const overdueCount = debts.filter(d => d.status === DebtStatus.OVERDUE).length;

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
                <p className="text-sm font-black text-gray-900 dark:text-white">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                    {overdueCount > 0 && (
                        <span className="text-[9px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded animate-pulse">{overdueCount} em atraso</span>
                    )}
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{debts.length} títulos</span>
                </div>
            </div>
        </button>
    );
};

export default CustomerGroupCard;
