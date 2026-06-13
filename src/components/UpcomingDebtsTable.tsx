import React from 'react';
import { MessageCircle, Clock, Calendar } from 'lucide-react';
import { Debt } from '../../types';

interface UpcomingDebtsTableProps {
    debts: Debt[];
    onWhatsApp: (debt: Debt) => void;
}

const UpcomingDebtsTable: React.FC<UpcomingDebtsTableProps> = ({ debts, onWhatsApp }) => {
    const isOverdue = (date: string) => new Date(date) < new Date();

    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-primary" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Próximas Cobranças</h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">{debts.length} pendentes</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-900/30">
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vencimento</th>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {debts.slice(0, 5).map((debt) => (
                            <tr key={debt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-7 h-7 rounded-lg ${debt.avatarColor || 'bg-primary'} flex items-center justify-center text-white font-semibold text-[10px]`}>
                                            {debt.customerName.charAt(0)}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{debt.customerName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock size={11} />
                                        {new Date(debt.dueDate).toLocaleDateString('pt-BR')}
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                                        R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5">
                                    <span className={`badge ${isOverdue(debt.dueDate) ? 'badge-danger' : 'badge-info'}`}>
                                        <span className={`status-dot ${isOverdue(debt.dueDate) ? 'bg-red-500' : 'bg-blue-500'} status-dot-active`}></span>
                                        {isOverdue(debt.dueDate) ? 'Vencido' : 'Em dia'}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5 text-right">
                                    <button
                                        onClick={() => onWhatsApp(debt)}
                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                        title="Enviar WhatsApp"
                                    >
                                        <MessageCircle size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {debts.slice(0, 5).map((debt) => (
                    <div key={debt.id} className="p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${debt.avatarColor || 'bg-primary'} flex items-center justify-center text-white font-semibold text-xs shrink-0`}>
                            {debt.customerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{debt.customerName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400">{new Date(debt.dueDate).toLocaleDateString('pt-BR')}</span>
                                <span className={`badge text-[8px] ${isOverdue(debt.dueDate) ? 'badge-danger' : 'badge-info'}`}>
                                    {isOverdue(debt.dueDate) ? 'Vencido' : 'Em dia'}
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono shrink-0">
                            R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                            onClick={() => onWhatsApp(debt)}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors shrink-0"
                        >
                            <MessageCircle size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {debts.length === 0 && (
                <div className="py-10 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2 block">event_available</span>
                    <p className="text-xs text-slate-400">Nenhuma cobrança pendente</p>
                </div>
            )}
        </div>
    );
};

export default UpcomingDebtsTable;
