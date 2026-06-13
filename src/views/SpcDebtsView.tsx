import React, { useState, useRef } from 'react';
import { Debt, DebtStatus } from '../../types';
import { Search, Edit3, X, Save, Undo, MessageCircle, Edit, TrendingUp, DollarSign, Trash2, ShieldAlert } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-red-100 dark:border-red-900/30 overflow-hidden hover:shadow-lg hover:shadow-red-500/5 transition-all">
            <div className="p-4 md:p-5">
                {/* Header SPC */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50 dark:border-slate-700">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">
                        ENTRADA NO SPC: {debt.spcDate ? formatDate(debt.spcDate) : '—'}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${debt.avatarColor || 'bg-primary'} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                            {debt.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-mono text-slate-400">#{debt.sequenceNumber?.toString().padStart(4, '0')}</span>
                                <span className="text-[10px] text-red-500 font-bold uppercase">{debt.customerCode}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{debt.customerName}</p>
                            {debt.customerDocument && (
                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Doc: {debt.customerDocument}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-left md:text-right bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-lg font-black text-slate-900 dark:text-white font-mono">
                            R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {debt.originalAmount !== debt.amount && (
                            <p className="text-[10px] text-slate-400 line-through font-mono">
                                R$ {(debt.originalAmount || debt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} original
                            </p>
                        )}
                        {interest > 0 && (
                            <p className="text-[10px] text-red-500 font-bold mt-0.5 font-mono">
                                + R$ {interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (juros)
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="badge bg-slate-50 dark:bg-slate-900 text-slate-500">
                        Cadastro: {formatDate(debt.registrationDate)}
                    </span>
                    <span className="badge bg-red-50 dark:bg-red-900/20 text-red-500">
                        Vencimento: {formatDate(debt.dueDate)}
                    </span>
                    {debt.category && (
                        <span className="badge badge-primary">
                            {debt.category}
                        </span>
                    )}
                </div>

                <div className="mt-2 mb-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5" /> Observações SPC
                        </span>
                        {!editingObs && (
                            <button
                                onClick={() => { setEditingObs(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                                className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 transition-colors"
                            >
                                <Edit className="w-3 h-3" /> {obsText ? 'Editar' : 'Adicionar'}
                            </button>
                        )}
                    </div>

                    {editingObs ? (
                        <div className="space-y-2 animate-fadeIn">
                            <textarea
                                ref={textareaRef}
                                value={obsText}
                                onChange={(e) => setObsText(e.target.value)}
                                rows={3}
                                placeholder="Registre contatos, acordos ou informações sobre a negativação..."
                                className="w-full text-xs p-3 rounded-xl border border-amber-200 dark:border-amber-700/50 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none resize-none placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveObs}
                                    disabled={savingObs}
                                    className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                    <Save className="w-3 h-3" /> {savingObs ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button
                                    onClick={handleCancelObs}
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => { setEditingObs(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                            className="text-xs text-slate-600 dark:text-slate-400 cursor-text"
                        >
                            {obsText ? <p className="whitespace-pre-wrap">{obsText}</p> : <p className="italic opacity-50">Clique para adicionar observações...</p>}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-700">
                    <button
                        onClick={() => onRemoveSpc(debt.id)}
                        disabled={isSaving}
                        className="btn btn-primary text-[10px] px-3 py-1.5"
                    >
                        <Undo className="w-3.5 h-3.5" /> Remover SPC
                    </button>

                    {debt.whatsapp && (
                        <button
                            onClick={() => onWhatsApp(debt)}
                            className="btn bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-3 py-1.5 shadow-emerald-500/20"
                        >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                    )}

                    <button
                        onClick={() => onEdit(debt)}
                        disabled={isSaving}
                        className="btn btn-ghost text-[10px] px-3 py-1.5"
                    >
                        <Edit className="w-3.5 h-3.5" /> Editar
                    </button>

                    {interest > 0 && (
                        <button
                            onClick={() => onPayInterest(debt.id)}
                            disabled={isSaving}
                            className="btn bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-3 py-1.5 shadow-amber-500/20"
                        >
                            <TrendingUp className="w-3.5 h-3.5" /> Juros
                        </button>
                    )}

                    <button
                        onClick={() => onPay(debt.id)}
                        disabled={isSaving}
                        className="btn bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] px-3 py-1.5 shadow-indigo-500/20"
                    >
                        <DollarSign className="w-3.5 h-3.5" /> Pagar
                    </button>

                    <button
                        onClick={() => onDelete(debt.id)}
                        disabled={isSaving}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all ml-auto"
                        title="Excluir"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const SpcDebtsView: React.FC<SpcDebtsViewProps> = ({
    debts, onPay, onEdit, onDelete, onPayInterest, onWhatsApp, onRemoveSpc, onSaveObservation, isSaving
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
        <div className="space-y-5 pb-8">
            <div className="bg-white dark:bg-slate-800/80 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">SPC Sumidos</h2>
                        <p className="text-[11px] text-slate-400">Clientes inadimplentes negativados</p>
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-900/30 text-center sm:text-right">
                    <div className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Total Negativado</div>
                    <div className="text-base font-bold text-red-600 dark:text-red-400 font-mono">
                        R$ {totalSpc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] font-semibold text-red-400">{spcDebts.length} registros</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar no SPC..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-sm transition-all dark:text-white placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spcDebts.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum débito no SPC</h3>
                        <p className="text-[11px] text-slate-400 mt-1">Débitos marcados como SPC aparecerão aqui.</p>
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
