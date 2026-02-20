import React from 'react';
import { Debt, DebtStatus } from '../../types';
import CustomerGroupCard from '../components/CustomerGroupCard';
import DebtItemRow from '../components/DebtItemRow';
import { isOverdue } from '../utils/status';

interface AlertsViewProps {
    groupedDebts: Record<string, Debt[]>;
    selectedCustomerCode: string | null;
    setSelectedCustomerCode: (code: string | null) => void;
    handlePay: (id: string) => void;
    handleDelete: (id: string) => void;
    handlePayInterest: (id: string) => void;
    onEdit: (debt: Debt) => void;
    showOnlyOverdue?: boolean;
    sortOption: 'none' | 'days-vencido' | 'alphabetical';
    setSortOption: (option: 'none' | 'days-vencido' | 'alphabetical') => void;
    onWhatsAppClick: (debt: Debt) => void;
    selectedMonth: number;
    selectedYear: number;
    isSaving?: boolean;
}

const AlertsView: React.FC<AlertsViewProps> = ({
    groupedDebts,
    selectedCustomerCode,
    setSelectedCustomerCode,
    handlePay,
    handleDelete,
    handlePayInterest,
    onEdit,
    showOnlyOverdue = false,
    sortOption,
    setSortOption,
    onWhatsAppClick,
    selectedMonth,
    selectedYear,
    isSaving
}) => {
    // Filter to show only overdue debts: unpaid debts with dueDate <= today
    // AND respect the selected month/year
    const filteredGroupedDebts = React.useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueGroups: Record<string, Debt[]> = {};

        (Object.entries(groupedDebts) as [string, Debt[]][]).forEach(([code, debts]) => {
            const overdueDebts = debts.filter(d => {
                if (d.status === DebtStatus.PAID || d.status === DebtStatus.SPC) return false;
                return isOverdue(d.dueDate);
            });

            if (overdueDebts.length > 0) {
                overdueGroups[code] = overdueDebts;
            }
        });

        return overdueGroups;
    }, [groupedDebts, selectedMonth, selectedYear]);

    const selectedCustomerDebts = selectedCustomerCode ? filteredGroupedDebts[selectedCustomerCode] || [] : [];
    const selectedCustomer = selectedCustomerDebts[0];

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className={`flex-1 space-y-4 ${selectedCustomerCode ? 'hidden lg:block' : 'block'}`}>
                <div className="flex items-center justify-between px-2 mb-4">
                    <h2 className="text-sm font-black uppercase text-gray-400 tracking-widest">Fila de Cobrança</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative group/sort">
                            <button className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${sortOption !== 'none' ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}>
                                <span className="material-symbols-outlined text-sm">{sortOption === 'days-vencido' ? 'schedule' : sortOption === 'alphabetical' ? 'sort_by_alpha' : 'sort'}</span>
                                {sortOption === 'days-vencido' ? 'Ordenar por: Mais dias vencido' : sortOption === 'alphabetical' ? 'Ordenar por: Alfabética' : 'Ordenar por...'}
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-50 invisible group-hover/sort:visible opacity-0 group-hover/sort:opacity-100 transition-all transform scale-95 group-hover/sort:scale-100 origin-top-right">
                                <button
                                    onClick={() => setSortOption('days-vencido')}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center gap-2 ${sortOption === 'days-vencido' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">schedule</span> Mais dias vencido
                                </button>
                                <button
                                    onClick={() => setSortOption('alphabetical')}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center gap-2 ${sortOption === 'alphabetical' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">sort_by_alpha</span> Alfabética
                                </button>
                                {sortOption !== 'none' && (
                                    <button
                                        onClick={() => setSortOption('none')}
                                        className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 border-t border-gray-100 dark:border-slate-700 mt-1 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span> Remover ordenação
                                    </button>
                                )}
                            </div>
                        </div>
                        {showOnlyOverdue && (
                            <span className="text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">filter_alt</span>
                                Atrasados
                            </span>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {Object.entries(filteredGroupedDebts).map(([code, customerDebts]: [string, Debt[]]) => (
                        <CustomerGroupCard
                            key={code}
                            customerName={customerDebts[0].customerName}
                            customerCode={code}
                            avatarColor={customerDebts[0].avatarColor}
                            debts={customerDebts}
                            onClick={() => setSelectedCustomerCode(code)}
                        />
                    ))}
                    {Object.keys(filteredGroupedDebts).length === 0 && (
                        <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                            <p className="text-sm text-gray-500 mt-2">Nenhum débito em aberto.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={`flex-1 ${selectedCustomerCode ? 'block' : 'hidden lg:block'}`}>
                {selectedCustomer ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden sticky top-32 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="p-6 bg-primary/5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full ${selectedCustomer.avatarColor} flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20`}>{selectedCustomer.customerName.charAt(0).toUpperCase()}</div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{selectedCustomer.customerName}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedCustomer.customerCode}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCustomerCode(null)} className="lg:hidden p-2 text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Detalhamento de Títulos</span>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{selectedCustomerDebts.length} Registro(s)</span>
                            </div>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide pr-1">
                                {selectedCustomerDebts.map(debt => (
                                    <DebtItemRow key={debt.id} debt={debt} onPay={handlePay} onDelete={handleDelete} onPayInterest={handlePayInterest} onEdit={onEdit} onWhatsAppClick={onWhatsAppClick} isSaving={isSaving} />
                                ))}
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-2">
                                <button className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">phone_in_talk</span> Ligar Cliente
                                </button>
                                <button
                                    onClick={() => selectedCustomer && onWhatsAppClick(selectedCustomer)}
                                    className="flex-1 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">mail</span> Cobrança Digital
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4"><span className="material-symbols-outlined text-3xl">touch_app</span></div>
                        <h3 className="text-gray-600 dark:text-gray-300 font-bold">Gerenciar Títulos</h3>
                        <p className="text-xs text-gray-400 mt-1">Selecione um cliente para processar pagamentos parciais ou excluir registros permanentes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsView;
