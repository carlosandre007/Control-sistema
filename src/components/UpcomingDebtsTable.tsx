import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import { Debt } from '../../types';

interface UpcomingDebtsTableProps {
    debts: Debt[];
    onWhatsApp: (debt: Debt) => void;
}

const UpcomingDebtsTable: React.FC<UpcomingDebtsTableProps> = ({ debts, onWhatsApp }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white">Próximas Cobranças</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Previsão</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Vencimento</th>
                            <th className="px-6 py-4">Valor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">WhatsApp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {debts.slice(0, 5).map((debt) => (
                            <tr key={debt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${debt.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                                            {debt.customerName.charAt(0)}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{debt.customerName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Clock size={12} />
                                        {new Date(debt.dueDate).toLocaleDateString('pt-BR')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                        R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${new Date(debt.dueDate) < new Date()
                                            ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
                                            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                        }`}>
                                        {new Date(debt.dueDate) < new Date() ? 'VENCIDO' : 'EM DIA'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onWhatsApp(debt)}
                                        className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                    >
                                        <MessageCircle size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {debts.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm italic">
                        Nenhuma cobrança futura.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingDebtsTable;
