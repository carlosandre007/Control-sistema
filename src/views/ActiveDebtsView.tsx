import React, { useState, useMemo } from 'react';
import { Debt, DebtStatus } from '../../types';
import { Search, Filter, Calendar, Plus, X, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DebtItemRow from '../components/DebtItemRow';
import ImportExportModal from '../components/ImportExportModal';
import { isOverdue } from '../utils/status';

interface ActiveDebtsViewProps {
    debts: Debt[];
    onPay: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onDelete: (id: string) => void;
    onPayInterest: (id: string) => void;
    onWhatsApp: (debt: Debt) => void;
    onSpc: (id: string) => void;
    onPayInstallment?: (debt: Debt, installment: any) => void;
    selectedCustomerCode: string | null;
    setSelectedCustomerCode: (code: string | null) => void;
    selectedMonth: number;
    selectedYear: number;
    isSaving?: boolean;
    userId: string;
    onRefresh: () => void;
}

const ActiveDebtsView: React.FC<ActiveDebtsViewProps> = ({
    debts, onPay, onEdit, onDelete, onPayInterest, onWhatsApp, onSpc, onPayInstallment,
    selectedCustomerCode, setSelectedCustomerCode, selectedMonth, selectedYear, isSaving,
    userId, onRefresh
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showOnlyNew, setShowOnlyNew] = useState(false);
    const [dueDay, setDueDay] = useState('');
    const [daySortOrder, setDaySortOrder] = useState<'none' | 'asc' | 'desc'>('none');
    const [isImportExportOpen, setIsImportExportOpen] = useState(false);

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

    const activeDebts = useMemo(() => {
        return debts
            .filter(d => {
                if (d.status === DebtStatus.PAID || d.status === DebtStatus.SPC) return false;
                const matchesSearch = d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesDate = filterByDate(d.dueDate);
                const matchesRegistrationMonth = !showOnlyNew || (d.registrationDate && d.registrationDate.startsWith(currentMonthStr));
                const matchesDueDay = !dueDay || (d.dueDate === `${currentMonthStr}-${dueDay.padStart(2, '0')}`);
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

    const paidDebts = useMemo(() => {
        return debts
            .filter(d => {
                if (d.status !== DebtStatus.PAID || d.status === DebtStatus.SPC) return false;
                const matchesSearch = d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesDate = filterByDate(d.dueDate);
                const matchesRegistrationMonth = !showOnlyNew || (d.registrationDate && d.registrationDate.startsWith(currentMonthStr));
                const matchesDueDay = !dueDay || (d.dueDate === `${currentMonthStr}-${dueDay.padStart(2, '0')}`);
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

    const hasFilters = startDate || endDate || showOnlyNew || selectedCustomerCode;

    return (
        <div className="space-y-5 pb-8">
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800/80 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Débitos Vigentes</h2>
                        <p className="text-[11px] text-slate-400">Gerencie todos os títulos em aberto</p>
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
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[9px] font-semibold text-slate-400 uppercase">Total em Aberto</div>
                        <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
                            R$ {activeDebts.reduce((sum, d) => sum + d.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar cliente..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all dark:text-white placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowOnlyNew(!showOnlyNew)}
                        className={`px-3 py-2 rounded-lg text-[11px] font-semibold transition-all border flex items-center gap-1.5 ${showOnlyNew
                            ? 'bg-primary text-white border-primary'
                            : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                    >
                        <Plus className="w-3 h-3" />
                        Novos
                    </button>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap ml-1">Dia:</span>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="--"
                            className="bg-transparent border-none text-[11px] font-bold text-slate-900 dark:text-white focus:ring-0 p-0 outline-none w-8 text-center"
                            value={dueDay}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
                                    setDueDay(val);
                                }
                            }}
                        />
                        {dueDay && (
                            <button onClick={() => setDueDay('')} className="p-1 text-slate-400 hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 px-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <input type="date" className="bg-transparent border-none text-[11px] font-semibold text-slate-700 dark:text-white focus:ring-0 py-2 px-1 outline-none w-[110px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <span className="text-slate-300 text-[10px]">→</span>
                        <input type="date" className="bg-transparent border-none text-[11px] font-semibold text-slate-700 dark:text-white focus:ring-0 py-2 px-1 outline-none w-[110px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>

                    {(hasFilters || dueDay) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); setShowOnlyNew(false); setSelectedCustomerCode(null); setDueDay(''); }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Limpar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Active Debts List */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Em Aberto ({activeDebts.length})</h3>
                    <button
                        onClick={() => setDaySortOrder(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            daySortOrder !== 'none'
                                ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                                : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary bg-white dark:bg-slate-900'
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
                    <div className="text-center py-12 bg-white dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 block mb-2">inbox</span>
                        <p className="text-xs text-slate-400">Nenhum débito vigente encontrado</p>
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
                            onPayInstallment={onPayInstallment}
                            isSaving={isSaving}
                        />
                    ))
                )}
            </div>

            {/* Paid Debts */}
            {paidDebts.length > 0 && (
                <div className="mt-8 space-y-2">
                    <h3 className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider px-1">Quitadas ({paidDebts.length})</h3>
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
