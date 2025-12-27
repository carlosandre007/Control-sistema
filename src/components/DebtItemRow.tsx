import React from 'react';
import { Debt, DebtStatus } from '../../types';
import { calculateInterest } from '../utils/finance';

interface DebtItemRowProps {
    debt: Debt;
    onPay: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (debt: Debt) => void;
}

const DebtItemRow: React.FC<DebtItemRowProps> = ({ debt, onPay, onDelete, onEdit }) => {
    const isPaid = debt.status === DebtStatus.PAID;
    const isOverdue = debt.status === DebtStatus.OVERDUE;
    const interest = calculateInterest(debt);

    return (
        <div className={`p-4 rounded-xl border ${isPaid ? 'bg-green-50/30 dark:bg-green-900/5 border-green-100 dark:border-green-900/20' : 'bg-gray-50 dark:bg-slate-900/40 border-gray-100 dark:border-slate-800'} flex items-center justify-between group transition-all`}>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => !isPaid && onPay(debt.id)}
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
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Vencimento: {new Date(debt.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="text-base font-bold text-gray-900 dark:text-white mt-0.5">R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        {debt.isRecurring && (
                            <span className="text-[9px] font-bold text-primary flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">autorenew</span> Recorrente
                            </span>
                        )}
                        <span className={`text-[9px] font-black uppercase ${isPaid ? 'text-success' :
                                debt.status === DebtStatus.UP_TO_DATE ? 'text-green-500' :
                                    isOverdue ? 'text-danger' : 'text-warning'
                            }`}>
                            {isPaid ? 'Título Pago' :
                                debt.status === DebtStatus.UP_TO_DATE ? 'Em Dia' :
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
                    <a
                        href={`https://wa.me/${debt.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${debt.customerName}, tudo bem? Notei que há um título em aberto no valor de R$ ${debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com vencimento em ${new Date(debt.dueDate).toLocaleDateString('pt-BR')}. Segue o link para pagamento...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xs">chat</span> WhatsApp
                    </a>
                )}
                {!isPaid ? (
                    <>
                        <button
                            onClick={() => onEdit(debt)}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-[10px] font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                        >
                            <span className="material-symbols-outlined text-xs">edit</span> Editar
                        </button>
                        <button
                            onClick={() => onPay(debt.id)}
                            className="px-3 py-1.5 bg-success text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                        >
                            <span className="material-symbols-outlined text-xs">payments</span> Pago Parcial
                        </button>
                    </>
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
