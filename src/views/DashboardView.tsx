import React from 'react';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import DashboardChart from '../components/DashboardChart';
import PaymentsTable from '../components/PaymentsTable';
import UpcomingDebtsTable from '../components/UpcomingDebtsTable';
import { DashboardStats, Debt, Transaction } from '../../types';
import { Target, TrendingUp, Users, FileText, Info, Clock, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

interface DashboardViewProps {
    stats: DashboardStats;
    overdueDebts: number;
    averageDelayDays: number;
    onViewOverdue: () => void;
    annualTransactions: Transaction[];
    debts: Debt[];
    selectedYear: number;
    onWhatsApp: (debt: Debt) => void;
    isSaving?: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    stats,
    overdueDebts,
    averageDelayDays,
    onViewOverdue,
    annualTransactions,
    debts,
    selectedYear,
    onWhatsApp,
    isSaving
}) => {
    // Preparar dados para o gráfico (agrupar transações por mês)
    const chartData = React.useMemo(() => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months.map((month, idx) => {
            const monthPrefix = `${selectedYear}-${(idx + 1).toString().padStart(2, '0')}`;

            const received = annualTransactions
                .filter(t => t.transactionDate && t.transactionDate.startsWith(monthPrefix))
                .reduce((sum, t) => sum + t.amount, 0);

            const toReceive = debts
                .filter(d => d.dueDate && d.dueDate.startsWith(monthPrefix) && d.status !== 'PAID')
                .reduce((sum, d) => sum + d.amount, 0);

            return { month, received, toReceive };
        });
    }, [annualTransactions, debts, selectedYear]);

    // Filtrar cobranças próximas
    const upcomingDebts = React.useMemo(() => {
        return debts
            .filter(d => d.status !== 'PAID')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [debts]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Top KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Recebido no Mês"
                    value={`R$ ${stats.receivedThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="DollarSign"
                    footer="Pagamentos totais e de juros"
                    color="success"
                />
                <StatCard
                    title="A Receber (Previsão)"
                    value={`R$ ${stats.toReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="Calendar"
                    footer="Títulos ativos do mês"
                    color="warning"
                />
                <StatCard
                    title="Vencidos (Crítico)"
                    value={`R$ ${stats.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="AlertTriangle"
                    footer={`${stats.overdueCount} títulos em atraso`}
                    color="danger"
                />
                <StatCard
                    title="Juros Recebidos"
                    value={`R$ ${stats.interestReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="TrendingUp"
                    footer="Apenas pagamentos de juros"
                    color="info"
                />
            </div>

            {/* Performance Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Taxa de Recuperação */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Target size={16} className="text-indigo-500" />
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Recuperação</span>
                        </div>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{stats.collectionEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, stats.collectionEfficiency)}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Média de Atraso</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{stats.averageDelayDays} <span className="text-xs font-normal">Dias</span></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Clientes Ativos</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{stats.totalClients}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Títulos Ativos</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{stats.activeCount}</p>
                    </div>
                </div>
            </div>

            {/* Alert Section */}
            {overdueDebts > 0 && (
                <AlertCard
                    title="Cobranças em Atraso"
                    description="Existem títulos vencidos que precisam de atenção imediata."
                    count={overdueDebts}
                    amount={stats.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    buttonText="Ver Vencidos"
                    onClick={onViewOverdue}
                />
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardChart
                    data={chartData}
                    title="Linha do Tempo Anual"
                />
                <PaymentsTable
                    transactions={annualTransactions}
                />
            </div>

            {/* Lower Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UpcomingDebtsTable
                    debts={upcomingDebts}
                    onWhatsApp={onWhatsApp}
                />

                {/* Health Section */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm h-full">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saúde Financeira</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Dicas para melhorar sua performance</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-start gap-3">
                            <Info size={16} className="text-indigo-500 mt-0.5" />
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                                Sua taxa de recuperação está em <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.collectionEfficiency.toFixed(1)}%</span>.
                                Considere enviar lembretes automáticos via WhatsApp para títulos que vencem nos próximos 3 dias.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-start gap-3 text-left">
                            <Info size={16} className="text-emerald-500 mt-0.5" />
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Você recebeu <span className="font-bold text-emerald-600">R$ {stats.receivedThisMonth.toLocaleString('pt-BR')}</span> este mês.
                                Continue assim para bater sua meta anual de recebimentos!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
