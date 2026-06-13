import React from 'react';
import { Debt, DebtStatus } from '../../types';
import CustomerGroupCard from '../components/CustomerGroupCard';
import DebtItemRow from '../components/DebtItemRow';
import { isOverdue } from '../utils/status';
import { Filter, SortAsc, Clock, SortDesc, Phone, Mail, UserX, X } from 'lucide-react';

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
    onSpc?: (id: string) => void;
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
    isSaving,
    onSpc
}) => {
    // Filter to show only overdue debts
    const filteredGroupedDebts = React.useMemo(() => {
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
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 pb-8">
            {/* Left Panel: Customer List */}
            <div className={`flex-1 space-y-4 ${selectedCustomerCode ? 'hidden lg:block' : 'block'}`}>
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Fila de Cobrança
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="relative group/sort">
                            <button className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${sortOption !== 'none' ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                {sortOption === 'days-vencido' ? <SortDesc className="w-3.5 h-3.5" /> : sortOption === 'alphabetical' ? <SortAsc className="w-3.5 h-3.5" /> : <Filter className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">
                                    {sortOption === 'days-vencido' ? 'Mais Atrasados' : sortOption === 'alphabetical' ? 'Alfabética' : 'Ordenar'}
                                </span>
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-50 invisible group-hover/sort:visible opacity-0 group-hover/sort:opacity-100 transition-all origin-top-right">
                                <button
                                    onClick={() => setSortOption('days-vencido')}
                                    className={`w-full text-left px-3 py-2 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 ${sortOption === 'days-vencido' ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    <SortDesc className="w-3.5 h-3.5" /> Mais atrasados
                                </button>
                                <button
                                    onClick={() => setSortOption('alphabetical')}
                                    className={`w-full text-left px-3 py-2 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 ${sortOption === 'alphabetical' ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    <SortAsc className="w-3.5 h-3.5" /> Alfabética
                                </button>
                                {sortOption !== 'none' && (
                                    <button
                                        onClick={() => setSortOption('none')}
                                        className="w-full text-left px-3 py-2 text-[11px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 border-t border-slate-100 dark:border-slate-700 mt-1 flex items-center gap-2"
                                    >
                                        <X className="w-3.5 h-3.5" /> Limpar ordenação
                                    </button>
                                )}
                            </div>
                        </div>
                        {showOnlyOverdue && (
                            <span className="text-[10px] font-bold bg-red-50 dark:bg-red-900/20 text-red-500 px-2 py-1 rounded-md flex items-center gap-1">
                                Atrasados
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 md:gap-3">
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
                        <div className="text-center py-16 bg-white dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined">done_all</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tudo em dia!</h3>
                            <p className="text-[11px] text-slate-400 mt-1">Nenhum débito em atraso encontrado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Customer Details */}
            <div className={`flex-1 lg:max-w-[45%] ${selectedCustomerCode ? 'block' : 'hidden lg:block'}`}>
                {selectedCustomer ? (
                    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24">
                        <div className="p-5 md:p-6 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${selectedCustomer.avatarColor || 'bg-primary'} flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20`}>
                                    {selectedCustomer.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate pr-4">{selectedCustomer.customerName}</h3>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedCustomer.customerCode}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCustomerCode(null)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Detalhamento</span>
                                <span className="badge badge-primary">{selectedCustomerDebts.length} pendentes</span>
                            </div>

                            <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
                                {selectedCustomerDebts.map(debt => (
                                    <DebtItemRow key={debt.id} debt={debt} onPay={handlePay} onDelete={handleDelete} onPayInterest={handlePayInterest} onEdit={onEdit} onWhatsAppClick={onWhatsAppClick} onSpc={onSpc} isSaving={isSaving} />
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                <button className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                                    <Phone size={14} /> <span className="hidden sm:inline">Ligar</span>
                                </button>
                                <button
                                    onClick={() => selectedCustomer && onWhatsAppClick(selectedCustomer)}
                                    className="flex-[2] py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Mail size={14} /> Cobrança Digital
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[calc(100vh-200px)] min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center sticky top-24">
                        <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4 shadow-sm">
                            <UserX size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum cliente selecionado</h3>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Selecione um cliente na lista ao lado para ver detalhes e processar cobranças.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsView;
