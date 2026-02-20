import React, { useState, useRef } from 'react';
import { Debt, DebtStatus } from '../../types';
import { Search } from 'lucide-react';
import { calculateInterest } from '../utils/finance';

interface SpcDebtsViewProps {
    debts: Debt[];
    onPay: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onDelete: (id: string) => void;
    onPayInterest: (id: string) => void;
    onWhatsApp: (debt: Debt) => void;
    onRemoveSpc: (id: string) => void;
    onSaveObservation: (id: string, observation: string) => Promise<void>;
    isSaving?: boolean;
}

// Card individual de débito SPC
const SpcDebtCard: React.FC<{
    debt: Debt;
    onPay: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onDelete: (id: string) => void;
    onPayInterest: (id: string) => void;
    onWhatsApp: (debt: Debt) => void;
    onRemoveSpc: (id: string) => void;
    onSaveObservation: (id: string, observation: string) => Promise<void>;
    isSaving?: boolean;
}> = ({ debt, onPay, onEdit, onDelete, onPayInterest, onWhatsApp, onRemoveSpc, onSaveObservation, isSaving }) => {
    const [editingObs, setEditingObs] = useState(false);
    const [obsText, setObsText] = useState(debt.spcObservation || '');
    const [savingObs, setSavingObs] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const interest = calculateInterest(debt);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
    };

    const handleSaveObs = async () => {
        setSavingObs(true);
        await onSaveObservation(debt.id, obsText);
        setSavingObs(false);
        setEditingObs(false);
    };

    const handleCancelObs = () => {
        setObsText(debt.spcObservation || '');
        setEditingObs(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden">

            {/* Corpo do card */}
            <div className="p-4">
                {/* Info de Entrada no SPC em destaque vermelho */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-slate-700">
                    <span className="material-symbols-outlined text-red-600 text-sm font-bold">gpp_bad</span>
                    <span className="text-red-600 text-[11px] font-black uppercase tracking-wider">
                        ENTRADA NO SPC: {debt.spcDate ? formatDate(debt.spcDate) : '—'}
                    </span>
                </div>

                {/* Linha superior: nome + código + valor */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-gray-400">#{debt.sequenceNumber?.toString().padStart(4, '0')}</span>
                            <span className="text-[10px] text-purple-500 font-bold uppercase">{debt.customerCode}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{debt.customerName}</p>
                        {debt.customerDocument && (
                            <p className="text-[10px] text-gray-400 mt-0.5">Doc: {debt.customerDocument}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                            R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {debt.originalAmount !== debt.amount && (
                            <p className="text-[10px] text-gray-400 line-through">
                                R$ {(debt.originalAmount || debt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} original
                            </p>
                        )}
                        {interest > 0 && (
                            <p className="text-[10px] text-red-500 font-bold mt-0.5">
                                + R$ {interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (juros)
                            </p>
                        )}
                    </div>
                </div>

                {/* Datas */}
                <div className="flex flex-wrap gap-3 mb-3 text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">event_note</span>
                        Cadastro: <b>{formatDate(debt.registrationDate)}</b>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        Vencimento: <b>{formatDate(debt.dueDate)}</b>
                    </span>
                    {debt.category && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">label</span>
                            {debt.category}
                        </span>
                    )}
                </div>

                {/* Área de Observação */}
                <div className="mt-2 mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">sticky_note_2</span>
                            Observações
                        </span>
                        {!editingObs && (
                            <button
                                onClick={() => { setEditingObs(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                                className="text-[10px] text-purple-500 hover:text-purple-700 font-bold flex items-center gap-0.5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xs">edit</span>
                                {obsText ? 'Editar' : 'Adicionar'}
                            </button>
                        )}
                    </div>

                    {editingObs ? (
                        <div className="space-y-2">
                            <textarea
                                ref={textareaRef}
                                value={obsText}
                                onChange={(e) => setObsText(e.target.value)}
                                rows={3}
                                placeholder="Adicione informações sobre o débito, contatos realizados, acordos tentados..."
                                className="w-full text-xs p-2.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 focus:ring-2 focus:ring-purple-400 outline-none resize-none placeholder:text-gray-400 text-gray-800 dark:text-gray-200"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveObs}
                                    disabled={savingObs}
                                    className="px-3 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-xs">save</span>
                                    {savingObs ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button
                                    onClick={handleCancelObs}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-xs">close</span>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => { setEditingObs(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                            className={`min-h-[40px] text-xs rounded-xl p-2.5 cursor-text transition-colors ${obsText
                                ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-gray-700 dark:text-gray-300'
                                : 'bg-gray-50 dark:bg-slate-900/30 border border-dashed border-gray-200 dark:border-slate-700 text-gray-400'
                                }`}
                        >
                            {obsText || 'Clique para adicionar observações...'}
                        </div>
                    )}
                </div>

                {/* Botões de ação */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <button
                        onClick={() => onRemoveSpc(debt.id)}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-xs">undo</span> Remover SPC
                    </button>

                    {debt.whatsapp && (
                        <button
                            onClick={() => onWhatsApp(debt)}
                            className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                        >
                            <span className="material-symbols-outlined text-xs">chat</span> WhatsApp
                        </button>
                    )}

                    <button
                        onClick={() => onEdit(debt)}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-[10px] font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-xs">edit</span> Editar
                    </button>

                    {interest > 0 && (
                        <button
                            onClick={() => onPayInterest(debt.id)}
                            disabled={isSaving}
                            className="px-3 py-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-xs">trending_up</span> Pagar Juros
                        </button>
                    )}

                    <button
                        onClick={() => onPay(debt.id)}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-xs">payments</span> Pagar Total
                    </button>

                    <button
                        onClick={() => onDelete(debt.id)}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50 ml-auto"
                    >
                        <span className="material-symbols-outlined text-xs">delete</span> Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

// =============================================
// VIEW PRINCIPAL
// =============================================
const SpcDebtsView: React.FC<SpcDebtsViewProps> = ({
    debts,
    onPay,
    onEdit,
    onDelete,
    onPayInterest,
    onWhatsApp,
    onRemoveSpc,
    onSaveObservation,
    isSaving
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const spcDebts = debts.filter(d => {
        if (d.status !== DebtStatus.SPC) return false;
        return d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (d.customerCode && d.customerCode.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const totalSpc = spcDebts.reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none border border-white/20 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
                        <span className="material-symbols-outlined text-3xl">gpp_bad</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SPC Sumidos</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Clientes inadimplentes negativados no SPC.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800">
                    <div className="text-center">
                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Total SPC</div>
                        <div className="text-lg font-black text-red-700 dark:text-red-300">
                            R$ {totalSpc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] font-bold text-red-400">{spcDebts.length} débito(s)</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-2xl border border-white/20 mb-8">
                <div className="relative flex-1 w-full max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar no SPC..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none text-sm transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Lista de Débitos SPC */}
            <div className="grid grid-cols-1 gap-4">
                {spcDebts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-red-200 dark:border-red-800">
                        <span className="material-symbols-outlined text-5xl text-red-300 dark:text-red-700 mb-3 block">shield_person</span>
                        <p className="text-gray-500 text-lg font-semibold">Nenhum débito no SPC</p>
                        <p className="text-gray-400 text-sm mt-1">Débitos marcados como SPC aparecerão aqui.</p>
                    </div>
                ) : (
                    spcDebts.map(debt => (
                        <SpcDebtCard
                            key={debt.id}
                            debt={debt}
                            onPay={onPay}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onPayInterest={onPayInterest}
                            onWhatsApp={onWhatsApp}
                            onRemoveSpc={onRemoveSpc}
                            onSaveObservation={onSaveObservation}
                            isSaving={isSaving}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SpcDebtsView;
