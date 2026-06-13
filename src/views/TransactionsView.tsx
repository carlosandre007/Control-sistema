import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Transaction } from '../../types';
import { Search, Filter, Download, Plus, ArrowDownLeft, Building2, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionsViewProps {
    onTransactionChange?: () => void;
    userId: string;
    selectedMonth: number;
    selectedYear: number;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ onTransactionChange, userId, selectedMonth, selectedYear }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (userId) fetchTransactions();
    }, [userId, selectedMonth, selectedYear]);

    const fetchTransactions = async () => {
        setLoading(true);
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const startOfMonth = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
        const endOfMonth = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .gte('transaction_date', startOfMonth)
            .lte('transaction_date', endOfMonth)
            .order('transaction_date', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
        } else {
            setTransactions(data.map((t: any) => ({
                id: t.id,
                createdAt: t.created_at,
                userId: t.user_id,
                chargeId: t.charge_id,
                customerName: t.customer_name,
                category: t.category,
                type: t.type,
                amount: Number(t.amount),
                transactionDate: t.transaction_date,
                description: t.description,
                paymentMethod: t.payment_method
            })));
        }
        setLoading(false);
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este registro de transação?')) return;

        try {
            const { error, count } = await supabase
                .from('transactions')
                .delete({ count: 'exact' })
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;

            if (count === 0) {
                alert('Não foi possível excluir a transação. Verifique se você tem permissão.');
                return;
            }

            setTransactions(prev => prev.filter(t => t.id !== id));
            onTransactionChange?.();
            alert('Transação excluída com sucesso!');
        } catch (error: any) {
            alert('Erro ao excluir transação: ' + error.message);
        }
    };

    const handleEditTransaction = async (id: string) => {
        alert('Funcionalidade de edição será implementada em breve.');
    };

    const filteredTransactions = transactions.filter(t =>
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'total_payment': return 'badge-success';
            case 'partial_payment': return 'badge-warning';
            case 'interest_payment': return 'badge-info';
            default: return 'badge-primary';
        }
    };

    const getStatusText = (type: string) => {
        switch (type) {
            case 'total_payment': return 'Pago';
            case 'partial_payment': return 'Parcial';
            case 'interest_payment': return 'Juros';
            default: return type;
        }
    };

    const totals = transactions.reduce((acc, t) => {
        const today = new Date().toISOString().split('T')[0];
        const isToday = t.transactionDate === today;

        if (t.type === 'total_payment' || t.type === 'partial_payment') {
            acc.totalEntries += t.amount;
            if (isToday) acc.todayEntries += t.amount;
        } else if (t.type === 'interest_payment') {
            acc.totalInterest += t.amount;
            if (isToday) acc.todayEntries += t.amount;
        }
        return acc;
    }, { todayEntries: 0, todayExits: 0, totalEntries: 0, totalInterest: 0 });

    return (
        <div className="space-y-5 pb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
                <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Entradas Hoje</span>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                        {totals.todayEntries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Recebimentos do dia</p>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Juros Recebidos</span>
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                            <Plus className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                        {totals.totalInterest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Total acumulado</p>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Volume Total</span>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-primary font-mono">
                        {(totals.totalEntries + totals.totalInterest).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Movimentação total</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar transação..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all dark:text-white placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => alert('Para registrar uma transação, realize o pagamento parcial ou total de uma dívida nas abas "Dívidas Ativas" ou "Alertas".')}
                    className="btn btn-primary text-xs"
                >
                    <Plus className="w-4 h-4" />
                    Nova Transação
                </button>
            </div>

            {/* Desktop Table */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="table-premium w-full">
                        <thead>
                            <tr>
                                <th className="px-5 py-3">Descrição / Cliente</th>
                                <th className="px-5 py-3">Categoria</th>
                                <th className="px-5 py-3">Data</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Valor</th>
                                <th className="px-5 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-5 py-4">
                                            <div className="skeleton skeleton-text w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center">
                                        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 block mb-2">receipt_long</span>
                                        <p className="text-xs text-slate-400">Nenhuma transação encontrada</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px]">
                                                    {t.customerName?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-800 dark:text-white">{t.customerName}</p>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{t.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="badge badge-primary">{t.category || 'Geral'}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-slate-500">
                                            {new Date(t.transactionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`badge ${getStatusColor(t.type)}`}>
                                                {getStatusText(t.type)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                                                {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditTransaction(t.id)} className="btn-ghost p-1.5 rounded-lg" title="Editar">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Excluir">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{filteredTransactions.length} de {transactions.length} transações</span>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                            <div className="skeleton skeleton-text w-3/4 mb-2"></div>
                            <div className="skeleton skeleton-text w-1/2"></div>
                        </div>
                    ))
                ) : filteredTransactions.length === 0 ? (
                    <div className="py-10 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 block mb-2">receipt_long</span>
                        <p className="text-xs text-slate-400">Nenhuma transação encontrada</p>
                    </div>
                ) : (
                    filteredTransactions.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px] shrink-0">
                                        {t.customerName?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{t.customerName}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{t.description}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono shrink-0">
                                    {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className={`badge ${getStatusColor(t.type)}`}>{getStatusText(t.type)}</span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(t.transactionDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionsView;
