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
}

const ClientsView: React.FC<ClientsViewProps> = ({
    groupedDebts,
    handleExcelUpload,
    handleExcelDemo,
    setActiveTab,
    setSelectedCustomerCode,
    onNewDebt
}) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 bg-success/10 text-success rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-4xl font-bold">table_chart</span></div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Importação via Excel</h3>
                        <p className="text-xs text-gray-500 mt-1">Suba sua planilha de clientes conforme a ordem solicitada.</p>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleExcelUpload} className="px-4 py-2 bg-success text-white text-xs font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md shadow-success/10"><span className="material-symbols-outlined text-sm">upload_file</span> Enviar Excel</button>
                            <button onClick={handleExcelDemo} className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><span className="material-symbols-outlined text-sm">download</span> Demo Planilha</button>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-4xl font-bold">person_add</span></div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Cadastro Manual</h3>
                        <p className="text-xs text-gray-500 mt-1">Adicione clientes um a um diretamente no sistema.</p>
                        <button onClick={onNewDebt} className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-md shadow-primary/10"><span className="material-symbols-outlined text-sm">person_add</span> Novo Registro</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Base de Dados Ativa (Ordenada)</h3>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{Object.keys(groupedDebts).length} Clientes</span>
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
                            {Object.entries(groupedDebts).map(([code, customerDebts]: [string, Debt[]]) => {
                                const totalPrincipal = customerDebts.reduce((a, b) => a + (b.status !== DebtStatus.PAID ? b.amount : 0), 0);
                                const totalInterest = customerDebts.reduce((a, b) => a + (b.status !== DebtStatus.PAID ? calculateInterest(b) : 0), 0);

                                const oldestDebt = customerDebts.reduce((prev, curr) =>
                                    new Date(curr.dueDate) < new Date(prev.dueDate) ? curr : prev
                                );
                                const mesAno = new Date(oldestDebt.dueDate).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

                                return (
                                    <tr key={code} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{code}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{customerDebts[0].customerName}</td>
                                        <td className="px-6 py-4 font-black text-gray-900 dark:text-white">R$ {(totalPrincipal + totalInterest).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                                            <div className="flex flex-col">
                                                <span>{mesAno}</span>
                                                {oldestDebt.registrationDate && (
                                                    <span className="text-[9px] text-gray-400">Reg: {new Date(oldestDebt.registrationDate).toLocaleDateString('pt-BR')}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-danger">R$ {totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => { setActiveTab('alerts'); setSelectedCustomerCode(code); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                            </button>
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
