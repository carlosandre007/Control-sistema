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
        <div className={`p-4 md:p-5 rounded-xl border transition-all duration-200 group ${isPaid
            ? 'bg-green-50/10 border-green-100 dark:border-green-900/10'
            : isOverdue
                ? 'bg-red-50/10 border-red-100 dark:border-red-900/10'
                : 'bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-900'
            }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Section: Main Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => !isPaid && !isSaving && onPay(debt.id)}
                        disabled={isSaving}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 shrink-0 transition-colors ${isPaid
                            ? 'bg-success border-success text-white'
                            : 'border-gray-200 dark:border-slate-800 bg-transparent hover:border-primary'
                            }`}
                    >
                        {isPaid && <span className="material-symbols-outlined text-base font-bold">check</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-bold text-gray-400 font-mono tracking-tighter">
                                #{debt.sequenceNumber?.toString().padStart(4, '0')}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isPaid ? 'text-green-500' : isOverdue ? 'text-red-500' : 'text-blue-500'
                                }`}>
                                {isPaid ? 'Liquidado' : isOverdue ? 'Atrasado' : 'Pendente'}
                            </span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">
                            {debt.customerName}
                        </h4>

                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">event</span>
                                {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('pt-BR') : '-'}
                            </div>
                            {isOverdue && daysOverdue > 0 && (
                                <div className="text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">priority_high</span>
                                    {daysOverdue} d
                                </div>
                            )}
                            {debt.isRecurring && (
                                <div className="text-primary flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">sync</span>
                                    Fixo
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section: Financials & Actions */}
                <div className="flex flex-row items-center justify-between md:justify-end gap-6 md:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50 dark:border-slate-900">
                    <div className="flex flex-col md:items-end">
                        <div className="text-lg font-black text-gray-900 dark:text-white leading-none">
                            <span className="text-[10px] font-bold mr-1">R$</span>
                            {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {interest > 0 && !isPaid && (
                            <div className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">add</span>
                                R$ {interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {debt.whatsapp && (
                            <button
                                onClick={() => onWhatsAppClick(debt)}
                                className="w-8 h-8 flex items-center justify-center text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                                title="WhatsApp"
                            >
                                <span className="material-symbols-outlined text-lg">chat</span>
                            </button>
                        )}

                        {!isPaid ? (
                            <>
                                <button
                                    onClick={() => onEdit(debt)}
                                    disabled={isSaving}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>

                                {interest > 0 && (
                                    <button
                                        onClick={() => onPayInterest(debt.id)}
                                        className="h-8 px-3 text-[10px] font-black uppercase text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                                    >
                                        Juros
                                    </button>
                                )}

                                <button
                                    onClick={() => onPay(debt.id)}
                                    className="h-8 px-4 text-[10px] font-black uppercase bg-success hover:bg-green-600 text-white rounded-lg transition-all shadow-sm active:scale-95"
                                >
                                    Pagar
                                </button>

                                {onSpc && (
                                    <button
                                        onClick={() => onSpc(debt.id)}
                                        disabled={isSaving}
                                        className="w-8 h-8 flex items-center justify-center text-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-lg transition-colors"
                                        title="Negativar SPC"
                                    >
                                        <span className="material-symbols-outlined text-lg">person_off</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => onDelete(debt.id)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Excluir"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onDelete(debt.id)}
                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
                                title="Excluir"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtItemRow;
