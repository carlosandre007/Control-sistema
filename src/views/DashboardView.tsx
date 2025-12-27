import React from 'react';
import StatCard from '../components/StatCard';
import { DashboardStats } from '../../types';

interface DashboardViewProps {
    stats: DashboardStats;
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Recebido no Mês Corrente"
                    value={`R$ ${stats.receivedThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="payments"
                    footer="Total faturado e liquidado"
                    color="success"
                />
                <StatCard
                    title="A Receber (Previsão Mês)"
                    value={`R$ ${stats.toReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="event_repeat"
                    footer="Títulos pendentes atuais"
                    color="warning"
                />
                <StatCard
                    title="Vencidos (Alerta Crítico)"
                    value={`R$ ${stats.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon="error"
                    footer={`${stats.overdueCount} títulos em atraso`}
                    color="danger"
                />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">insights</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Relatório de Performance</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">Utilize a aba de Clientes para importar novos dados ou a Ação Rápida para gerenciar títulos em aberto.</p>
            </div>
        </div>
    );
};

export default DashboardView;
