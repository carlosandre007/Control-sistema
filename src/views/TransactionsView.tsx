import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Transaction } from '../../types';
import { Search, Filter, Download, Plus, ArrowDownLeft, ArrowUpRight, Building2, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

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
            onTransactionChange?.(); // Notify parent
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
            case 'total_payment': return 'text-success';
            case 'partial_payment': return 'text-warning';
            case 'interest_payment': return 'text-blue-500';
            default: return 'text-gray-500';
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ENTRADAS (HOJE)</span>
                        <div className="p-2 bg-success/10 rounded-lg">
                            <ArrowDownLeft className="w-5 h-5 text-success" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {totals.todayEntries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Soma de todos os recebimentos hoje</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">JUROS RECEBIDOS (TOTAL)</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Plus className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {totals.totalInterest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Total acumulado de juros</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">VOLUME TOTAL</span>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-primary">
                            {(totals.totalEntries + totals.totalInterest).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Movimentação total registrada</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar transação..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
                        <Filter className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
                        <Download className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <button
                    onClick={() => alert('Para registrar uma transação, realize o pagamento parcial ou total de uma dívida nas abas "Dívidas Ativas" ou "Alertas".')}
                    className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nova Transação
                </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição / Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Carrregando...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Nenhuma transação encontrada.</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-primary transition-colors cursor-pointer" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {t.customerName?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.customerName}</p>
                                                    <p className="text-xs text-gray-500">{t.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                {t.category || 'Geral'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(t.transactionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-1.5 text-sm font-medium ${getStatusColor(t.type)}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full current-color bg-current`} />
                                                {getStatusText(t.type)}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'total_payment' || t.type === 'partial_payment' ? 'text-gray-900 dark:text-white' : 'text-danger'}`}>
                                            {t.type === 'total_payment' || t.type === 'partial_payment' ? '' : '- '}
                                            {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 transition-opacity">
                                                <button
                                                    onClick={() => handleEditTransaction(t.id)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTransaction(t.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
                    <span>Mostrando {filteredTransactions.length} de {transactions.length} transações</span>
                    <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionsView;
