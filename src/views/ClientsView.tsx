import React from 'react';
import { Debt, DebtStatus } from '../../types';
import { calculateInterest } from '../utils/finance';

interface ClientsViewProps {
    groupedDebts: Record<string, Debt[]>;
    handleExcelUpload: () => void;
    handleExcelDemo: () => void;
    setActiveTab: (tab: 'dashboard' | 'alerts' | 'clients') => void;
    setSelectedCustomerCode: (code: string | null) => void;
    onNewDebt: () => void;
    onDeleteClient: (customerCode: string) => void;
    onBackupExport: () => void;
    onEditClient: (customerCode: string) => void;
    onOpenPanel: (customerCode: string) => void;
}

const ClientsView: React.FC<ClientsViewProps> = ({
    groupedDebts,
    handleExcelUpload,
    handleExcelDemo,
    setActiveTab,
    setSelectedCustomerCode,
    onNewDebt,
    onDeleteClient,
    onBackupExport,
    onEditClient,
    onOpenPanel
}) => {
    const sortedGroupedDebts = React.useMemo(() => {
        return Object.entries(groupedDebts)
            .sort(([, debtsA], [, debtsB]) =>
                debtsA[0].customerName.localeCompare(debtsB[0].customerName, 'pt-BR')
            );
    }, [groupedDebts]);

    return (
        <div className="space-y-5 pb-8">
            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">table_chart</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Importação</h3>
                    <p className="text-[11px] text-slate-400 mt-1 mb-4">Importe listas via Excel</p>
                    <div className="flex gap-2">
                        <button onClick={handleExcelUpload} className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-sm">upload_file</span> Importar
                        </button>
                        <button onClick={handleExcelDemo} className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all" title="Baixar Modelo">
                            <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">person_add</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Novo Cliente</h3>
                    <p className="text-[11px] text-slate-400 mt-1 mb-4">Adicione manualmente</p>
                    <button onClick={onNewDebt} className="w-full px-3 py-2 bg-primary hover:bg-primary-hover text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-primary/15">
                        <span className="material-symbols-outlined text-sm">add_circle</span> Criar
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 group hover:border-amber-200 dark:hover:border-amber-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">cloud_download</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Extrair Dados</h3>
                    <p className="text-[11px] text-slate-400 mt-1 mb-4">Backup das cobranças</p>
                    <button onClick={onBackupExport} className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-amber-500/15">
                        <span className="material-symbols-outlined text-sm">download</span> Baixar
                    </button>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Base de Clientes</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Gestão centralizada</p>
                    </div>
                    <span className="badge badge-primary">{Object.keys(groupedDebts).length} ativos</span>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="table-premium w-full">
                        <thead>
                            <tr>
                                <th className="px-5 py-3">Código</th>
                                <th className="px-5 py-3">Nome</th>
                                <th className="px-5 py-3">Valor Devido</th>
                                <th className="px-5 py-3">Vencimento</th>
                                <th className="px-5 py-3">Juros</th>
                                <th className="px-5 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedGroupedDebts.map(([code, customerDebts]: [string, Debt[]]) => {
                                const totalPrincipal = customerDebts.reduce((a, b) => a + (b.status !== DebtStatus.PAID ? b.amount : 0), 0);
                                const totalInterest = customerDebts.reduce((a, b) => a + (b.status !== DebtStatus.PAID ? calculateInterest(b) : 0), 0);
                                const oldestDebt = customerDebts.reduce((prev, curr) => new Date(curr.dueDate) < new Date(prev.dueDate) ? curr : prev);
                                const mesAno = new Date(oldestDebt.dueDate).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

                                return (
                                    <tr key={code} className="group">
                                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">{code}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-7 h-7 rounded-lg ${customerDebts[0].avatarColor || 'bg-primary'} flex items-center justify-center text-white font-semibold text-[10px]`}>
                                                    {customerDebts[0].customerName.charAt(0).toUpperCase()}
                                                </div>
                                                <button onClick={() => onOpenPanel(code)} className="text-xs font-semibold text-slate-800 dark:text-white hover:text-primary transition-colors text-left">
                                                    {customerDebts[0].customerName}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">R$ {totalPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-slate-500">{mesAno}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs font-bold text-red-500 font-mono">R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setActiveTab('alerts'); setSelectedCustomerCode(code); }} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Ver Dívidas">
                                                    <span className="material-symbols-outlined text-base">visibility</span>
                                                </button>
                                                <button onClick={() => onEditClient(code)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Editar">
                                                    <span className="material-symbols-outlined text-base">edit_square</span>
                                                </button>
                                                <button onClick={() => onDeleteClient(code)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Excluir">
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedGroupedDebts.map(([code, customerDebts]: [string, Debt[]]) => {
                        const totalPrincipal = customerDebts.reduce((a, b) => a + (b.status !== DebtStatus.PAID ? b.amount : 0), 0);
                        const totalInterest = customerDebts.reduce((a, b) => a + (b.status !== DebtStatus.PAID ? calculateInterest(b) : 0), 0);

                        return (
                            <div key={code} className="p-4" onClick={() => onOpenPanel(code)}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl ${customerDebts[0].avatarColor || 'bg-primary'} flex items-center justify-center text-white font-semibold text-xs shrink-0`}>
                                        {customerDebts[0].customerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{customerDebts[0].customerName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">{code}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">R$ {totalPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        {totalInterest > 0 && (
                                            <p className="text-[10px] font-semibold text-red-500 font-mono">+R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {Object.keys(groupedDebts).length === 0 && (
                    <div className="py-12 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 block mb-2">group</span>
                        <p className="text-xs text-slate-400">Nenhum cliente cadastrado</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientsView;
