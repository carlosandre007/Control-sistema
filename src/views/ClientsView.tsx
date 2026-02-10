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
    // Sort clients alphabetically by name
    const sortedGroupedDebts = React.useMemo(() => {
        return Object.entries(groupedDebts)
            .sort(([, debtsA], [, debtsB]) =>
                debtsA[0].customerName.localeCompare(debtsB[0].customerName, 'pt-BR')
            );
    }, [groupedDebts]);
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-white/20 shadow-xl shadow-gray-200/20 dark:shadow-none flex flex-col gap-6 group hover:border-success/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-success/10 text-success rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-3xl">table_chart</span></div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Importação</h3>
                        <p className="text-sm text-gray-500 mt-2">Agilize seu trabalho importando listas completas via Excel.</p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleExcelUpload} className="flex-1 px-4 py-2.5 bg-success text-white text-xs font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 transition-all"><span className="material-symbols-outlined text-sm">upload_file</span> Importar</button>
                            <button onClick={handleExcelDemo} className="p-2.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all" title="Baixar Modelo"><span className="material-symbols-outlined text-sm">download</span></button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-white/20 shadow-xl shadow-gray-200/20 dark:shadow-none flex flex-col gap-6 group hover:border-primary/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-3xl">person_add</span></div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Novo Cliente</h3>
                        <p className="text-sm text-gray-500 mt-2">Adicione um novo pagador manualmente preenchendo o formulário.</p>
                        <button onClick={onNewDebt} className="w-full mt-6 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-indigo-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"><span className="material-symbols-outlined text-sm">add_circle</span> Criar Registro</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-white/20 shadow-xl shadow-gray-200/20 dark:shadow-none flex flex-col gap-6 group hover:border-orange-500/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-3xl">cloud_download</span></div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Extrair Dados</h3>
                        <p className="text-sm text-gray-500 mt-2">Gere um backup completo de todas as cobranças ativas.</p>
                        <button onClick={onBackupExport} className="w-full mt-6 px-4 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"><span className="material-symbols-outlined text-sm">download</span> Baixar Planilha</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-white/20 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Base de Dados de Clientes</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Gestão centralizada de todos os pagadores.</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{Object.keys(groupedDebts).length} Ativos</span>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Código do Cliente</th>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Valor Total Devido</th>
                                <th className="px-6 py-4">Mês/Ano Vencimento</th>
                                <th className="px-6 py-4">Juros a Pagar</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {sortedGroupedDebts.map(([code, customerDebts]: [string, Debt[]]) => {
                                const totalPrincipal = customerDebts.reduce((a, b) => a + (b.status !== DebtStatus.PAID ? b.amount : 0), 0);
                                const totalInterest = customerDebts.reduce((a, b) => a + (b.status !== DebtStatus.PAID ? calculateInterest(b) : 0), 0);

                                const oldestDebt = customerDebts.reduce((prev, curr) =>
                                    new Date(curr.dueDate) < new Date(prev.dueDate) ? curr : prev
                                );
                                const mesAno = new Date(oldestDebt.dueDate).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

                                return (
                                    <tr key={code} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                                        <td className="px-8 py-5 font-mono text-xs text-gray-400">{code}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${customerDebts[0].avatarColor || 'bg-primary'} flex items-center justify-center text-white font-bold text-xs`}>
                                                    {customerDebts[0].customerName.charAt(0).toUpperCase()}
                                                </div>
                                                <button
                                                    onClick={() => onOpenPanel(code)}
                                                    className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors text-left"
                                                >
                                                    {customerDebts[0].customerName}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-bold text-gray-900 dark:text-white">R$ {totalPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{mesAno}</span>
                                                {oldestDebt.registrationDate && (
                                                    <span className="text-[10px] text-gray-400">Desde {new Date(oldestDebt.registrationDate).toLocaleDateString('pt-BR')}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-bold text-red-500">R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => { setActiveTab('alerts'); setSelectedCustomerCode(code); }}
                                                    className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                    title="Ver Dívidas"
                                                >
                                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => onEditClient(code)}
                                                    className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                    title="Editar Cadastro"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit_square</span>
                                                </button>
                                                <button
                                                    onClick={() => onDeleteClient(code)}
                                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Excluir Cliente"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {Object.keys(groupedDebts).length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-sm text-gray-400">Nenhum dado para exibir.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientsView;
