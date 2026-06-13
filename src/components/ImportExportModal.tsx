import React, { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle2, Loader2, Info, ArrowRight } from 'lucide-react';
import { Debt, DebtStatus } from '../../types';
import { exportDebtsToExcel, parseExcelForImport, ImportPreviewRow } from '../utils/excel';
import { supabase } from '../utils/supabase';

interface ImportExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDebts: Debt[];
    userId: string;
    onRefresh: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose, currentDebts, userId, onRefresh }) => {
    const [step, setStep] = useState<'initial' | 'preview' | 'processing' | 'done'>('initial');
    const [previewData, setPreviewData] = useState<ImportPreviewRow[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState({ success: 0, errors: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            exportDebtsToExcel(currentDebts);
        } catch (error) {
            console.error('Export error:', error);
            alert('Erro ao exportar arquivo.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStep('processing');
        try {
            const data = await parseExcelForImport(file, currentDebts);
            setPreviewData(data);
            setStep('preview');
        } catch (error) {
            console.error('Import error:', error);
            alert('Erro ao ler arquivo. Certifique-se de usar o modelo exportado pelo sistema.');
            setStep('initial');
        }
    };

    const handleStartImport = async () => {
        const changeableData = previewData.filter(d => d.errors.length === 0 && d.hasChanges);
        if (changeableData.length === 0) {
            alert('Nenhuma alteração detectada para importar.');
            return;
        }

        setIsImporting(true);
        setStep('processing');
        setProgress(0);
        let success = 0;
        let errors = 0;

        for (let i = 0; i < changeableData.length; i++) {
            const row = changeableData[i];
            try {
                // Apenas os campos permitidos pela regra de negócio
                const payload = {
                    customer_name: row.newName,
                    amount: row.newAmount,
                    due_date: row.newDueDate,
                    whatsapp: row.newWhatsapp,
                };

                const { error } = await supabase
                    .from('debts')
                    .update(payload)
                    .eq('id', row.id)
                    .eq('user_id', userId);
                
                if (error) throw error;
                success++;
            } catch (err) {
                console.error(`Error updating row ${row.index}:`, err);
                errors++;
            }
            setProgress(Math.round(((i + 1) / changeableData.length) * 100));
        }

        setResults({ success, errors });
        setStep('done');
        onRefresh();
    };

    const hasCriticalErrors = previewData.some(d => d.errors.length > 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/10 flex flex-col">
                
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Download className="w-8 h-8 text-primary" />
                            Sincronização via Excel
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Edição controlada de Nome, Valor, Vencimento e WhatsApp.
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 'initial' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">
                            <div className="space-y-6">
                                <div className="bg-primary/10 p-8 rounded-[2rem] border border-primary/20 group hover:bg-primary/20 transition-all cursor-pointer" onClick={handleExport}>
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                                        <Download className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Exportar para Edição</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Baixe o arquivo com os débitos atuais. Apenas Nome, Valor, Data e WhatsApp podem ser alterados.
                                    </p>
                                    <div className="mt-6 inline-flex items-center gap-2 text-primary font-bold">
                                        {isExporting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Baixar .xlsx'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div 
                                    className="bg-success/10 p-8 rounded-[2rem] border border-success/20 group hover:bg-success/20 transition-all cursor-pointer relative"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept=".xlsx" 
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-16 h-16 bg-success rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-success/30 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Importar Alterações</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Suba o arquivo editado para validar e aplicar as mudanças no sistema com total segurança.
                                    </p>
                                    <div className="mt-6 inline-flex items-center gap-2 text-success font-bold">
                                        Selecionar arquivo
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Conferência de Dados (De / Para)</h3>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${hasCriticalErrors ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                                        {hasCriticalErrors ? 'Erros Críticos' : 'Validação Concluída'}
                                    </span>
                                </div>
                            </div>

                            <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[450px] overflow-y-auto shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-10">
                                        <tr>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 w-16">Linha</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400">Nome (Antigo → Novo)</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400">Valor (Antigo → Novo)</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400">Vencimento</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {previewData.map((row) => (
                                            <React.Fragment key={row.index}>
                                                <tr className={`transition-colors ${row.errors.length > 0 ? 'bg-danger/5' : row.hasChanges ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                                                    <td className="px-4 py-4 text-xs font-mono text-gray-400">#{row.index}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-[10px] text-gray-400 mb-1">{row.oldData?.customerName || '---'}</div>
                                                        <div className={`text-sm font-bold flex items-center gap-2 ${row.newName !== row.oldData?.customerName ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                                            {row.newName}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-[10px] text-gray-400 mb-1">
                                                            R$ {row.oldData?.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </div>
                                                        <div className={`text-sm font-black flex items-center gap-2 ${row.newAmount !== row.oldData?.amount ? 'text-success' : 'text-gray-900 dark:text-white'}`}>
                                                            R$ {row.newAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-[10px] text-gray-400 mb-1">{row.oldData?.dueDate}</div>
                                                        <div className={`text-sm font-medium ${row.newDueDate !== row.oldData?.dueDate ? 'text-primary' : 'text-gray-500'}`}>
                                                            {row.newDueDate}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                       {row.errors.length > 0 ? (
                                                           <AlertCircle className="w-5 h-5 text-danger mx-auto" />
                                                       ) : row.hasChanges ? (
                                                           <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-2 py-1 rounded-md uppercase tracking-tighter">Alterado</span>
                                                       ) : (
                                                           <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tighter">Igual</span>
                                                       )}
                                                    </td>
                                                </tr>
                                                {row.errors.length > 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-2 bg-danger/10">
                                                            <div className="flex flex-wrap gap-2 italic">
                                                                {row.errors.map((err, i) => (
                                                                    <span key={i} className="text-[10px] font-bold text-danger">⚠️ {err}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-wrap gap-8">
                                <div className="flex-1 min-w-[150px]">
                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Analisado</div>
                                    <div className="text-xl font-black text-gray-900 dark:text-white">{previewData.length}</div>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <div className="text-[10px] font-black text-amber-500 uppercase mb-1">Mudanças Detectadas</div>
                                    <div className="text-xl font-black text-amber-500">{previewData.filter(d => d.hasChanges && d.errors.length === 0).length}</div>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <div className="text-[10px] font-black text-danger uppercase mb-1">Críticos (Ignorados)</div>
                                    <div className="text-xl font-black text-danger">{previewData.filter(d => d.errors.length > 0).length}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-gray-100 dark:text-slate-800"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={364.4}
                                        strokeDashoffset={364.4 - (364.4 * progress) / 100}
                                        strokeLinecap="round"
                                        className="text-primary transition-all duration-300"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                                        {progress}%
                                    </span>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sincronizando com o Banco</h3>
                                <p className="text-sm text-gray-500 mt-1">Auditando e aplicando alterações...</p>
                            </div>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center animate-in slide-in-from-bottom-8 duration-500">
                            <div className="w-24 h-24 bg-success/20 rounded-[2rem] flex items-center justify-center text-success mb-2">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white">Sincronização Concluída</h3>
                                <p className="text-gray-500 mt-2 max-w-sm">
                                    O banco de dados foi atualizado com as informações validadas da planilha.
                                </p>
                            </div>
                            <div className="flex gap-4 w-full max-w-sm">
                                <div className="flex-1 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div className="text-[10px] font-black text-gray-400 mb-1 uppercase">Atualizados</div>
                                    <div className="text-2xl font-black text-success">{results.success}</div>
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div className="text-[10px] font-black text-gray-400 mb-1 uppercase">Erros/Pulados</div>
                                    <div className="text-2xl font-black text-danger">{results.errors}</div>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-12 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                            >
                                Fechar e Recarregar
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step === 'preview' && (
                    <div className="p-8 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                        <button 
                            onClick={() => setStep('initial')}
                            className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Trocar Arquivo
                        </button>
                        <div className="flex items-center gap-4">
                             <button 
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200/50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleStartImport}
                                disabled={isImporting || hasCriticalErrors || (previewData.filter(d => d.hasChanges).length === 0)}
                                className="bg-primary hover:bg-primary-dark text-white px-10 py-3.5 rounded-2xl font-black shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all flex items-center gap-2"
                            >
                                {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Aplicar Alterações
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportExportModal;
