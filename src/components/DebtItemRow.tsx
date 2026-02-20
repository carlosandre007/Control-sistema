import React from 'react';
import { Debt, DebtStatus } from '../../types';
import { calculateInterest } from '../utils/finance';

interface DebtItemRowProps {
    debt: Debt;
    onPay: (id: string) => void;
    onDelete: (id: string) => void;
    onPayInterest: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onWhatsAppClick: (debt: Debt) => void;
    onSpc?: (id: string) => void;
    isSaving?: boolean;
}

const DebtItemRow: React.FC<DebtItemRowProps> = ({ debt, onPay, onDelete, onPayInterest, onEdit, onWhatsAppClick, onSpc, isSaving }) => {
    const today = React.useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const dueDate = React.useMemo(() => {
        if (!debt.dueDate) return new Date();
        const [year, month, day] = debt.dueDate.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [debt.dueDate]);

    const isPaid = debt.status === DebtStatus.PAID;
    const isOverdue = !isPaid && dueDate <= today;
    const interest = calculateInterest(debt);

    // Calculate days overdue
    const daysOverdue = React.useMemo(() => {
        if (!isOverdue) return 0;
        return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    }, [isOverdue, today, dueDate]);

    return (
        <div className={`p-4 rounded-xl border ${isPaid ? 'bg-green-50/30 dark:bg-green-900/5 border-green-100 dark:border-green-900/20' : 'bg-gray-50 dark:bg-slate-900/40 border-gray-100 dark:border-slate-800'} flex items-center justify-between group transition-all`}>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => !isPaid && !isSaving && onPay(debt.id)}
                    disabled={isSaving}
                    className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${isPaid
                        ? 'bg-success border-success text-white'
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary'
                        }`}
                >
                    {isPaid && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                </button>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400">#{debt.sequenceNumber?.toString().padStart(4, '0')}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Cadastrada em: {debt.registrationDate ? new Date(debt.registrationDate).toLocaleDateString('pt-BR') : '-'} (FIXA)</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tight line-clamp-1">{debt.customerName}</span>
                    <div className="flex items-end gap-3 mt-0.5">
                        <span className="text-base font-bold text-gray-900 dark:text-white">R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-[10px] font-normal text-gray-400">Atual</span></span>
                        <span className="text-xs text-gray-400 line-through mb-0.5">R$ {(debt.originalAmount || debt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-[8px] no-underline">Original</span></span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        {debt.isRecurring && (
                            <span className="text-[9px] font-bold text-primary flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">autorenew</span> Recorrente
                            </span>
                        )}
                        {isOverdue && (
                            daysOverdue > 0 ? (
                                <span className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse shadow-sm">
                                    ⚠️ {daysOverdue} dia{daysOverdue !== 1 ? 's' : ''} vencido
                                </span>
                            ) : (
                                <span className="text-[10px] font-black text-white bg-amber-500 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                    🔔 Vence HOJE
                                </span>
                            )
                        )}
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">calendar_today</span>
                            Vence: {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('pt-BR') : '-'}
                        </span>
                        <span className={`text-[9px] font-black uppercase ${isPaid ? 'text-success' :
                            debt.status === DebtStatus.UP_TO_DATE ? 'text-green-500' :
                                isOverdue ? 'text-danger' : 'text-warning'
                            }`}>
                            {isPaid ? 'Título Pago' :
                                debt.status === DebtStatus.UP_TO_DATE ? 'Em Aberto' :
                                    isOverdue ? 'Atrasado' : 'A Vencer'}
                        </span>
                        {interest > 0 && !isPaid && (
                            <span className="text-[9px] font-bold text-danger bg-red-100 dark:bg-red-900/20 px-1 rounded">
                                + R$ {interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Juros)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {debt.whatsapp && (
                    <button
                        onClick={() => onWhatsAppClick(debt)}
                        className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xs">chat</span> WhatsApp
                    </button>
                )}
                {!isPaid ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(debt)}
                            disabled={isSaving}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-[10px] font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-xs">edit</span> Editar
                        </button>
                        <button
                            onClick={() => onDelete(debt.id)}
                            disabled={isSaving}
                            className="p-1 px-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-xs">delete</span> Excluir
                        </button>
                        {onSpc && (
                            <button
                                onClick={() => onSpc(debt.id)}
                                disabled={isSaving}
                                className="px-3 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-xs">person_off</span> SPC
                            </button>
                        )}
                        {interest > 0 && (
                            <button
                                onClick={() => onPayInterest(debt.id)}
                                disabled={isSaving}
                                className="px-3 py-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-xs">trending_up</span> Pagar Juros
                            </button>
                        )}
                        <button
                            onClick={() => onPay(debt.id)}
                            disabled={isSaving}
                            className="px-3 py-1.5 bg-success text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-xs">payments</span> Pagar Total
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onDelete(debt.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xs">delete_forever</span> Excluir
                    </button>
                )}
            </div>
        </div>
    );
};

export default DebtItemRow;
