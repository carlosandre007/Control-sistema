import React, { useState } from 'react';
import { Debt, DebtStatus } from '../../types';
import { Search, ShieldAlert } from 'lucide-react';
import DebtItemRow from '../components/DebtItemRow';

interface SpcDebtsViewProps {
    debts: Debt[];
    onPay: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onDelete: (id: string) => void;
    onPayInterest: (id: string) => void;
    onWhatsApp: (debt: Debt) => void;
    onRemoveSpc: (id: string) => void;
    isSaving?: boolean;
}

const SpcDebtsView: React.FC<SpcDebtsViewProps> = ({
    debts,
    onPay,
    onEdit,
    onDelete,
    onPayInterest,
    onWhatsApp,
    onRemoveSpc,
    isSaving
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const spcDebts = debts.filter(d => {
        if (d.status !== DebtStatus.SPC) return false;
        return d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const totalSpc = spcDebts.reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none border border-white/20 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined text-3xl">person_off</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SPC Sumidos</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Débitos não pagos removidos da lista de vigentes. Clientes inadimplentes.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
                    <div className="text-center">
                        <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Total SPC</div>
                        <div className="text-lg font-black text-purple-700 dark:text-purple-300">
                            R$ {totalSpc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] font-bold text-purple-400">{spcDebts.length} débito(s)</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-2xl border border-white/20 mb-8">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar no SPC..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-sm transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* SPC Debts List */}
            <div className="space-y-3">
                {spcDebts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-purple-200 dark:border-purple-800">
                        <span className="material-symbols-outlined text-5xl text-purple-300 dark:text-purple-700 mb-3 block">shield_person</span>
                        <p className="text-gray-500 text-lg font-semibold">Nenhum débito no SPC</p>
                        <p className="text-gray-400 text-sm mt-1">Débitos marcados como SPC aparecerão aqui.</p>
                    </div>
                ) : (
                    spcDebts.map(debt => (
                        <div key={debt.id} className="relative">
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-full"></div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <DebtItemRow
                                        debt={debt}
                                        onPay={onPay}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onPayInterest={onPayInterest}
                                        onWhatsAppClick={onWhatsApp}
                                        isSaving={isSaving}
                                    />
                                </div>
                                <button
                                    onClick={() => onRemoveSpc(debt.id)}
                                    disabled={isSaving}
                                    className="px-4 py-2.5 bg-emerald-500 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-sm">undo</span> Remover SPC
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SpcDebtsView;
