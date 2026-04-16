import React, { useState, useMemo } from 'react';
import { Debt, DebtStatus } from '../../types';
import { Search, Filter, Calendar, Plus, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DebtItemRow from '../components/DebtItemRow';
import ImportExportModal from '../components/ImportExportModal';

interface ActiveDebtsViewProps {
    debts: Debt[];
    onPay: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onDelete: (id: string) => void;
    onPayInterest: (id: string) => void;
    onWhatsApp: (debt: Debt) => void;
    onSpc: (id: string) => void;
    selectedCustomerCode: string | null;
    setSelectedCustomerCode: (code: string | null) => void;
    selectedMonth: number;
    selectedYear: number;
    isSaving?: boolean;
    userId: string;
    onRefresh: () => void;
}

const ActiveDebtsView: React.FC<ActiveDebtsViewProps> = ({
    debts,
    onPay,
    onEdit,
    onDelete,
    onPayInterest,
    onWhatsApp,
    onSpc,
    selectedCustomerCode,
    setSelectedCustomerCode,
    selectedMonth,
    selectedYear,
    isSaving,
    userId,
    onRefresh
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [showOnlyNew, setShowOnlyNew] = useState(false);
    const [isImportExportOpen, setIsImportExportOpen] = useState(false);
    const [daySortOrder, setDaySortOrder] = useState<'none' | 'asc' | 'desc'>('none');

    const filterByDate = (date: string) => {
        if (!startDate && !endDate) return true;
        const d = new Date(date);
        if (startDate && d < new Date(startDate)) return false;
        if (endDate && d > new Date(endDate)) return false;
        return true;
    };

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentMonthStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;

    // 1. Filter and Sort ACTIVE debts
    const activeDebts = useMemo(() => {
        return debts
            .filter(d => {
                if (d.status === DebtStatus.PAID || d.status === DebtStatus.SPC) return false;

                const matchesSearch = d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));

                const matchesDate = filterByDate(d.dueDate);

                const matchesRegistrationMonth = !showOnlyNew || (
                    d.registrationDate && d.registrationDate.startsWith(currentMonthStr)
                );

                const matchesDueDay = !dueDay || (
                    d.dueDate === `${currentMonthStr}-${dueDay.padStart(2, '0')}`
                );

                const matchesCustomer = !selectedCustomerCode || d.customerCode === selectedCustomerCode;

                return matchesSearch && matchesDate && matchesRegistrationMonth && matchesDueDay && matchesCustomer;
            })
            .sort((a, b) => {
                if (daySortOrder !== 'none') {
                    const dayA = parseInt(a.dueDate?.split('-')[2] || '0');
                    const dayB = parseInt(b.dueDate?.split('-')[2] || '0');
                    return daySortOrder === 'asc' ? dayA - dayB : dayB - dayA;
                }
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
    }, [debts, searchTerm, startDate, endDate, showOnlyNew, dueDay, daySortOrder, selectedCustomerCode, currentMonthStr]);

    // 2. Filter and Sort PAID debts
    const paidDebts = useMemo(() => {
        return debts
            .filter(d => {
                if (d.status !== DebtStatus.PAID || d.status === DebtStatus.SPC) return false;

                const matchesSearch = d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));

                const matchesDate = filterByDate(d.dueDate);

                const matchesRegistrationMonth = !showOnlyNew || (
                    d.registrationDate && d.registrationDate.startsWith(currentMonthStr)
                );

                const matchesDueDay = !dueDay || (
                    d.dueDate === `${currentMonthStr}-${dueDay.padStart(2, '0')}`
                );

                const matchesCustomer = !selectedCustomerCode || d.customerCode === selectedCustomerCode;

                return matchesSearch && matchesDate && matchesRegistrationMonth && matchesDueDay && matchesCustomer;
            })
            .sort((a, b) => {
                if (daySortOrder !== 'none') {
                    const dayA = parseInt(a.dueDate?.split('-')[2] || '0');
                    const dayB = parseInt(b.dueDate?.split('-')[2] || '0');
                    return daySortOrder === 'asc' ? dayA - dayB : dayB - dayA;
                }
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            });
    }, [debts, searchTerm, startDate, endDate, showOnlyNew, dueDay, daySortOrder, selectedCustomerCode, currentMonthStr]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header / Instructions */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none border border-white/20 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Débitos Vigentes 3</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Acompanhe e gerencie todos os títulos em aberto no sistema.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsImportExportOpen(true)}
                        className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 font-bold rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        <span>Planilha Excel</span>
                    </button>
                    
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-gray-100 dark:border-slate-700">
                        <div className="px-4 py-2 text-center">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Geral em Aberto</div>
                            <div className="text-lg font-black text-gray-900 dark:text-white">
                                R$ {activeDebts.reduce((sum, d) => sum + d.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {/* ... rest of the component remains same ... */}
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20 mb-8">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar cliente, código ou descrição..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <button
                        onClick={() => setShowOnlyNew(!showOnlyNew)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${showOnlyNew
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-white dark:bg-slate-900 text-gray-500 border-gray-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Novos do Mês
                    </button>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex-1 md:flex-none">
                        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Dia Vencimento:</span>
                        <style>{`
                            .due-day-input::-webkit-inner-spin-button,
                            .due-day-input::-webkit-outer-spin-button {
                                opacity: 1;
                                transform: scale(2);
                                cursor: pointer;
                                margin-right: 4px;
                            }
                        `}</style>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="--"
                            className="due-day-input bg-transparent border-none text-sm font-black text-gray-900 dark:text-white focus:ring-0 p-0 outline-none w-12 text-center"
                            value={dueDay}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
                                    setDueDay(val);
                                }
                            }}
                        />
                        {dueDay && (
                            <button
                                onClick={() => setDueDay('')}
                                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors shrink-0"
                                title="Limpar filtro de dia"
                            >
                                <span className="text-xs font-bold">✕</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex-1 md:flex-none">
                        <div className="pl-3 text-gray-400">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <input
                            type="date"
                            className="bg-transparent border-none text-xs font-bold text-gray-900 dark:text-white focus:ring-0 py-2 px-1 outline-none min-w-[110px]"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            title="Data Inicial"
                        />
                        <span className="text-gray-300 dark:text-gray-600">to</span>
                        <input
                            type="date"
                            className="bg-transparent border-none text-xs font-bold text-gray-900 dark:text-white focus:ring-0 py-2 px-1 outline-none min-w-[110px]"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            title="Data Final"
                        />
                    </div>

                    {(startDate || endDate || showOnlyNew || selectedCustomerCode || dueDay) && (
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setShowOnlyNew(false);
                                setDueDay('');
                                setSelectedCustomerCode(null);
                            }}
                            className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-xl transition-all"
                            title="Limpar Filtros"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    )}

                    <div className="hidden lg:flex items-center gap-2 px-3 py-2 text-gray-400 border-l border-gray-100 dark:border-slate-700 ml-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Filtros</span>
                    </div>
                </div>
            </div>

            {/* Active Debts List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Dívidas em Aberto</h3>
                    <button
                        onClick={() => setDaySortOrder(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            daySortOrder !== 'none'
                                ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                                : 'text-gray-400 border-gray-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary bg-white dark:bg-slate-900'
                        }`}
                        title={daySortOrder === 'none' ? 'Ordenar por dia' : daySortOrder === 'asc' ? 'Ordem crescente (clique para decrescente)' : 'Ordem decrescente (clique para desativar)'}
                    >
                        {daySortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                        ) : daySortOrder === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                            <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                        Dia
                    </button>
                </div>
                {activeDebts.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500">Nenhum débito vigente encontrado.</p>
                    </div>
                ) : (
                    activeDebts.map(debt => (
                        <DebtItemRow
                            key={debt.id}
                            debt={debt}
                            onPay={onPay}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onPayInterest={onPayInterest}
                            onWhatsAppClick={onWhatsApp}
                            onSpc={onSpc}
                            isSaving={isSaving}
                        />
                    ))
                )}
            </div>

            {/* Paid Debts List */}
            {paidDebts.length > 0 && (
                <div className="mt-12 space-y-3">
                    <h3 className="text-sm font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-2">Dívidas Quitadas</h3>
                    {paidDebts.map(debt => (
                        <DebtItemRow
                            key={debt.id}
                            debt={debt}
                            onPay={onPay}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onPayInterest={onPayInterest}
                            onWhatsAppClick={onWhatsApp}
                            isSaving={isSaving}
                        />
                    ))}
                </div>
            )}

            <ImportExportModal 
                isOpen={isImportExportOpen}
                onClose={() => setIsImportExportOpen(false)}
                currentDebts={debts}
                userId={userId}
                onRefresh={onRefresh}
            />
        </div>
    );
};

export default ActiveDebtsView;

