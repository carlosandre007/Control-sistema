import React from 'react';
import StatCard from '../components/StatCard';
import DashboardChart from '../components/DashboardChart';
import UpcomingDebtsTable from '../components/UpcomingDebtsTable';
import { DashboardStats, Debt, Transaction } from '../../types';
import { Target, TrendingUp, Users, FileText, Clock, Download } from 'lucide-react';
import { exportDebtsToPDF } from '../utils/pdfExport';

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

    const upcomingDebts = React.useMemo(() => {
        return debts
            .filter(d => d.status !== 'PAID' && d.status !== 'SPC')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [debts]);

    return (
        <div className="space-y-6 md:space-y-8 pb-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                <StatCard
                    title="Em Aberto"
                    value={`R$ ${debts.filter(d => d.status !== 'PAID').reduce((sum, d) => sum + d.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="Target"
                    footer="Títulos vigentes"
                    color="primary"
                />
                <StatCard
                    title="Recebido"
                    value={`R$ ${stats.receivedThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="DollarSign"
                    footer="No mês atual"
                    color="success"
                />
                <StatCard
                    title="Vencidos"
                    value={`R$ ${stats.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="AlertTriangle"
                    footer={`${stats.overdueCount} títulos`}
                    color="danger"
                    action={overdueDebts > 0 && (
                        <button
                            onClick={onViewOverdue}
                            className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                            Ver
                        </button>
                    )}
                />
                <StatCard
                    title="Quitadas"
                    value={`R$ ${debts.filter(d => d.status === 'PAID').reduce((sum, d) => sum + d.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="TrendingUp"
                    footer="Total liquidado"
                    color="info"
                />
            </div>

            {/* Performance Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                {/* Recovery Rate */}
                <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Recuperação</span>
                        </div>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">{stats.collectionEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, stats.collectionEfficiency)}%` }} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 dark:bg-red-900/15 text-red-500 rounded-xl shrink-0">
                        <Clock size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Atraso Médio</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{stats.averageDelayDays} <span className="text-xs font-normal text-slate-400">dias</span></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/15 text-blue-500 rounded-xl shrink-0">
                        <Users size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Clientes</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{stats.totalClients}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-500 rounded-xl shrink-0">
                        <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Títulos</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{stats.activeCount}</p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <DashboardChart data={chartData} title="Linha do Tempo Anual">
                <button
                    onClick={() => exportDebtsToPDF(debts)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all active:scale-95"
                >
                    <Download size={13} />
                    PDF
                </button>
            </DashboardChart>

            {/* Upcoming Table */}
            <UpcomingDebtsTable debts={upcomingDebts} onWhatsApp={onWhatsApp} />
        </div>
    );
};

export default DashboardView;
