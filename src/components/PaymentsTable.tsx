import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { Transaction } from '../../types';

interface PaymentsTableProps {
    transactions: Transaction[];
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({ transactions }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white">Últimos Pagamentos</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mês Atual</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Valor</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {transactions.slice(0, 5).map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            {tx.customerName.charAt(0)}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{tx.customerName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Clock size={12} />
                                        {new Date(tx.transactionDate).toLocaleDateString('pt-BR')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${tx.type === 'total_payment'
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                        }`}>
                                        {tx.type === 'total_payment' ? 'TOTAL' : 'JUROS'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm italic">
                        Nenhum pagamento registrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentsTable;
