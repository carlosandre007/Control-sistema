import React, { useState, useEffect, useMemo } from 'react';
import { Debt, DebtStatus, Installment } from '../../types';
import { supabase } from '../utils/supabase';
import { calculateDebtStatus } from '../utils/status';
import { formatDateToISO, getNextMonthDate } from '../utils/date';

interface DebtFormModalProps {
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    editingDebt?: Debt | null;
}

interface ClientSuggestion {
    customer_name: string;
    customer_code: string;
    customer_document?: string;
    whatsapp?: string;
    avatar_color: string;
}

const DebtFormModal: React.FC<DebtFormModalProps> = ({ onClose, onSuccess, userId, editingDebt }) => {
    const [loading, setLoading] = useState(false);
    const [existingClients, setExistingClients] = useState<ClientSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredClients, setFilteredClients] = useState<ClientSuggestion[]>([]);
    const [isWhatsappManual, setIsWhatsappManual] = useState(false);
    const [showWhatsappHint, setShowWhatsappHint] = useState(false);
    
    // Installment States
    const [isInstallmentMode, setIsInstallmentMode] = useState(false);
    const [instConfig, setInstConfig] = useState({
        totalAmount: '',
        installmentsCount: '',
        downPayment: '',
        firstInstallmentDate: getNextMonthDate(formatDateToISO(new Date())),
        recurrenceType: 'Mensal' as 'Mensal' | 'Quinzenal' | 'Semanal'
    });

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_code: '',
        customer_document: '',
        whatsapp: '',
        amount: '',
        original_amount: '',
        registration_date: formatDateToISO(new Date()),
        due_date: getNextMonthDate(formatDateToISO(new Date())),
        status: DebtStatus.UP_TO_DATE,
        interest_amount: '0',
        avatar_color: 'bg-primary',
        is_recurring: true,
        category: 'Serviços',
        description: ''
    });

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase
                .from('debts')
                .select('customer_name, customer_code, customer_document, whatsapp, avatar_color')
                .eq('user_id', userId);

            if (data && !error) {
                const uniqueClientsMap = new Map<string, ClientSuggestion>();
                data.forEach(d => {
                    const existing = uniqueClientsMap.get(d.customer_code);
                    const score = (d.whatsapp ? 2 : 0) + (d.customer_document ? 1 : 0);
                    const existingScore = existing ? ((existing.whatsapp ? 2 : 0) + (existing.customer_document ? 1 : 0)) : -1;

                    if (!existing || score > existingScore) {
                        uniqueClientsMap.set(d.customer_code, {
                            customer_name: d.customer_name,
                            customer_code: d.customer_code,
                            customer_document: d.customer_document,
                            whatsapp: d.whatsapp,
                            avatar_color: d.avatar_color
                        });
                    }
                });
                setExistingClients(Array.from(uniqueClientsMap.values()));
            }
        };
        fetchClients();
    }, [userId]);

    useEffect(() => {
        if (editingDebt) {
            setFormData({
                customer_name: editingDebt.customerName,
                customer_code: editingDebt.customerCode,
                customer_document: editingDebt.customerDocument || '',
                whatsapp: editingDebt.whatsapp || '',
                amount: editingDebt.amount.toString(),
                original_amount: (editingDebt.originalAmount || editingDebt.amount).toString(),
                registration_date: editingDebt.registrationDate || formatDateToISO(new Date()),
                due_date: editingDebt.dueDate,
                status: editingDebt.status,
                interest_amount: (editingDebt.interestAmount || 0).toString(),
                avatar_color: editingDebt.avatarColor || 'bg-primary',
                is_recurring: editingDebt.isRecurring,
                category: editingDebt.category || 'Serviços',
                description: editingDebt.description || ''
            });
            setIsInstallmentMode(!!editingDebt.isInstallment);
        } else {
            const fetchNextCode = async () => {
                const { data, error } = await supabase
                    .from('debts')
                    .select('customer_code')
                    .eq('user_id', userId);

                if (data && !error) {
                    const numericCodes = data.map(d => {
                        const match = d.customer_code.match(/\d+/);
                        return match ? parseInt(match[0]) : 0;
                    }).filter(code => code > 0);

                    let smallestCode = 1;
                    if (numericCodes.length > 0) {
                        const sortedCodes = [...new Set(numericCodes)].sort((a, b) => a - b);
                        if (sortedCodes[0] !== 1) {
                            smallestCode = 1;
                        } else {
                            let foundGap = false;
                            for (let i = 0; i < sortedCodes.length - 1; i++) {
                                if (sortedCodes[i + 1] - sortedCodes[i] > 1) {
                                    smallestCode = sortedCodes[i] + 1;
                                    foundGap = true;
                                    break;
                                }
                            }
                            if (!foundGap) smallestCode = sortedCodes[sortedCodes.length - 1] + 1;
                        }
                    }
                    setFormData(prev => ({ ...prev, customer_code: `#${smallestCode.toString().padStart(4, '0')}` }));
                }
            };
            fetchNextCode();
        }
    }, [userId, editingDebt]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.customer_name.length >= 4) {
                searchClients(formData.customer_name);
            } else {
                setFilteredClients([]);
                setShowSuggestions(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [formData.customer_name]);

    const searchClients = async (query: string) => {
        try {
            let { data, error } = await supabase
                .from('clients')
                .select('name, customer_code, customer_document, whatsapp, avatar_color')
                .ilike('name', `%${query}%`)
                .limit(5);

            if (error) {
                const { data: debtsData, error: debtsError } = await supabase
                    .from('debts')
                    .select('customer_name, customer_code, customer_document, whatsapp, avatar_color')
                    .ilike('customer_name', `%${query}%`)
                    .limit(20);

                if (debtsError) throw debtsError;

                const unique = new Map<string, ClientSuggestion>();
                (debtsData || []).forEach(d => {
                    const existing = unique.get(d.customer_code);
                    const score = (d.whatsapp ? 2 : 0) + (d.customer_document ? 1 : 0);
                    const existingScore = existing ? ((existing.whatsapp ? 2 : 0) + (existing.customer_document ? 1 : 0)) : -1;

                    if (!existing || score > existingScore) {
                        unique.set(d.customer_code, {
                            customer_name: d.customer_name,
                            customer_code: d.customer_code,
                            customer_document: d.customer_document,
                            whatsapp: d.whatsapp,
                            avatar_color: d.avatar_color
                        });
                    }
                });
                setFilteredClients(Array.from(unique.values()));
            } else {
                setFilteredClients((data || []).map(c => ({
                    customer_name: c.name,
                    customer_code: c.customer_code,
                    customer_document: c.customer_document,
                    whatsapp: c.whatsapp,
                    avatar_color: c.avatar_color
                })));
            }
            setShowSuggestions(true);
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const handleCustomerNameChange = (value: string) => {
        setFormData(prev => ({ ...prev, customer_name: value }));

        if (!isWhatsappManual && value.length > 2) {
            const exactMatch = existingClients.find(
                client => client.customer_name.toLowerCase() === value.trim().toLowerCase()
            );

            if (exactMatch) {
                setFormData(prev => ({
                    ...prev,
                    whatsapp: exactMatch.whatsapp || '',
                    customer_document: exactMatch.customer_document || prev.customer_document,
                    customer_code: exactMatch.customer_code,
                    avatar_color: exactMatch.avatar_color
                }));
                setShowWhatsappHint(!exactMatch.whatsapp);
                setIsWhatsappManual(false);
            }
        }
    };

    const handleSelectClient = (client: ClientSuggestion) => {
        setFormData({
            ...formData,
            customer_name: client.customer_name,
            customer_code: client.customer_code,
            customer_document: client.customer_document || formData.customer_document,
            whatsapp: client.whatsapp || '',
            avatar_color: client.avatar_color
        });
        setIsWhatsappManual(false);
        setShowWhatsappHint(!client.whatsapp);
        setShowSuggestions(false);
    };

    const handleDueDateChange = (date: string) => {
        setFormData({
            ...formData,
            due_date: date,
            status: calculateDebtStatus(date, formData.status)
        });
    };

    // Auto-calculate installments preview
    const previewInstallments = useMemo(() => {
        if (!isInstallmentMode) return [];
        const total = parseFloat(instConfig.totalAmount || '0');
        const count = parseInt(instConfig.installmentsCount || '0');
        const down = parseFloat(instConfig.downPayment || '0');

        if (isNaN(total) || isNaN(count) || count <= 0) return [];

        const financed = Math.max(0, total - down);
        const installmentValue = financed / count;
        
        let currentDate = new Date(instConfig.firstInstallmentDate + 'T12:00:00');
        const result = [];

        for (let i = 1; i <= count; i++) {
            result.push({
                installment_number: i,
                amount: installmentValue,
                due_date: formatDateToISO(currentDate),
                status: 'PENDING'
            });

            // Increment date based on recurrence
            if (instConfig.recurrenceType === 'Mensal') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else if (instConfig.recurrenceType === 'Quinzenal') {
                currentDate.setDate(currentDate.getDate() + 15);
            } else if (instConfig.recurrenceType === 'Semanal') {
                currentDate.setDate(currentDate.getDate() + 7);
            }
        }
        return result;
    }, [isInstallmentMode, instConfig]);

    const financedAmount = useMemo(() => {
        const total = parseFloat(instConfig.totalAmount || '0');
        const down = parseFloat(instConfig.downPayment || '0');
        return isNaN(total) ? 0 : Math.max(0, total - (isNaN(down) ? 0 : down));
    }, [instConfig.totalAmount, instConfig.downPayment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Determine final values based on mode
            const finalAmount = isInstallmentMode ? parseFloat(instConfig.totalAmount || '0') : parseFloat(formData.amount);
            const finalDueDate = isInstallmentMode && previewInstallments.length > 0 
                ? previewInstallments[0].due_date 
                : formData.due_date;

            const payload = {
                customer_name: formData.customer_name,
                customer_code: formData.customer_code,
                customer_document: formData.customer_document,
                whatsapp: formData.whatsapp,
                amount: finalAmount,
                original_amount: isInstallmentMode ? finalAmount : parseFloat(formData.original_amount || formData.amount),
                registration_date: formData.registration_date,
                due_date: finalDueDate,
                status: isInstallmentMode ? DebtStatus.PENDING : formData.status,
                interest_amount: parseFloat(formData.interest_amount || '0'),
                avatar_color: formData.avatar_color,
                is_recurring: isInstallmentMode ? false : formData.is_recurring, // disable basic recurrence if using installments
                is_installment: isInstallmentMode,
                category: formData.category,
                description: formData.description,
                user_id: userId
            };

            let debtId = '';

            if (editingDebt) {
                debtId = editingDebt.id;
                const { error } = await supabase
                    .from('debts')
                    .update(payload)
                    .eq('id', debtId);

                if (error) throw error;

                if (formData.customer_name !== editingDebt.customerName) {
                    await supabase
                        .from('debts')
                        .update({ customer_name: formData.customer_name })
                        .eq('customer_code', editingDebt.customerCode)
                        .eq('user_id', userId);
                }
                alert('Regra de cobrança atualizada!');
            } else {
                const { data: newDebt, error } = await supabase
                    .from('debts')
                    .insert([payload])
                    .select()
                    .single();
                if (error) throw error;
                debtId = newDebt.id;

                // Handle Down Payment (Entrada) as an immediate transaction if any
                const down = parseFloat(instConfig.downPayment || '0');
                if (isInstallmentMode && down > 0 && !isNaN(down)) {
                    await supabase.from('transactions').insert([{
                        user_id: userId,
                        charge_id: debtId,
                        customer_name: formData.customer_name,
                        category: formData.category,
                        type: 'total_payment',
                        amount: down,
                        transaction_date: formatDateToISO(new Date()),
                        description: 'VALOR DA ENTRADA'
                    }]);
                    
                    // Update debt amount to reflect down payment
                    const remainingAmount = finalAmount - down;
                    await supabase.from('debts').update({ amount: remainingAmount }).eq('id', debtId);
                }

                // Insert Installments
                if (isInstallmentMode && previewInstallments.length > 0) {
                    const installmentsPayload = previewInstallments.map(inst => ({
                        debt_id: debtId,
                        user_id: userId,
                        amount: inst.amount,
                        due_date: inst.due_date,
                        status: 'PENDING',
                        installment_number: inst.installment_number
                    }));

                    const { error: instError } = await supabase.from('installments').insert(installmentsPayload);
                    if (instError) throw instError;
                }

                alert('Nova regra de cobrança criada!');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isSubmitDisabled = loading || !formData.customer_name || 
        (isInstallmentMode 
            ? (!instConfig.totalAmount || !instConfig.installmentsCount || parseInt(instConfig.installmentsCount) <= 0) 
            : !formData.amount);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 duration-200 border border-white/20 transition-all ${isInstallmentMode ? 'max-w-4xl' : 'max-w-2xl'}`}>
                {/* Header Section */}
                <div className="px-8 pt-8 pb-4 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md z-20 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Voltar para Dívidas
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cadastro de Dívida</h2>
                    <p className="text-sm text-gray-400 mt-1">Preencha os dados abaixo para registrar uma nova dívida.</p>
                </div>

                <div className={`p-8 grid gap-8 ${isInstallmentMode ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    <form onSubmit={handleSubmit} className={`space-y-8 ${isInstallmentMode ? 'lg:col-span-2' : ''}`}>
                        {/* Section 1: Client Information */}
                        <div className="space-y-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-slate-700">Informações da Dívida</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Credor / Banco / Cartão</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-lg">person</span>
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white"
                                            value={formData.customer_name}
                                            onChange={e => handleCustomerNameChange(e.target.value)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            placeholder="Ex: Banco do Brasil, Visa..."
                                            autoComplete="off"
                                        />
                                        {showSuggestions && filteredClients.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                {filteredClients.map((client, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleSelectClient(client)}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                                                    >
                                                        <div className={`w-8 h-8 rounded-full ${client.avatar_color} flex items-center justify-center text-white font-bold text-xs`}>
                                                            {client.customer_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{client.customer_name}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono">{client.customer_code}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">CPF / CNPJ</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-lg">badge</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white font-semibold"
                                            value={formData.customer_document}
                                            onChange={e => setFormData({ ...formData, customer_document: e.target.value })}
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">WhatsApp</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                                            <span className="material-symbols-outlined text-lg text-green-500">chat</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all text-gray-900 dark:text-white"
                                            value={formData.whatsapp}
                                            onChange={e => {
                                                setFormData({ ...formData, whatsapp: e.target.value });
                                                setIsWhatsappManual(true);
                                                setShowWhatsappHint(false);
                                            }}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Toggle Installment Mode */}
                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isInstallmentMode}
                                        onChange={e => {
                                            if (editingDebt) {
                                                alert("Não é possível alterar o modo de parcelamento na edição.");
                                                return;
                                            }
                                            setIsInstallmentMode(e.target.checked);
                                        }}
                                        disabled={!!editingDebt}
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${isInstallmentMode ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isInstallmentMode ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Dívida Parcelada</span>
                                    <p className="text-[10px] text-gray-500">Gere múltiplas parcelas com datas automáticas.</p>
                                </div>
                            </label>
                        </div>

                        {!isInstallmentMode ? (
                            <>
                                {/* Section: Dates and Deadlines (Standard) */}
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-slate-700">Datas e Prazos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">DATA DA DÍVIDA (FIXA)</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                                                </div>
                                                <input
                                                    required={!isInstallmentMode}
                                                    type="date"
                                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white appearance-none"
                                                    value={formData.registration_date}
                                                    onChange={e => setFormData({ ...formData, registration_date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Data de Vencimento</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-lg">event_busy</span>
                                                </div>
                                                <input
                                                    required={!isInstallmentMode}
                                                    type="date"
                                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white appearance-none"
                                                    value={formData.due_date}
                                                    onChange={e => handleDueDateChange(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Values (Standard) */}
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-slate-700">Valores</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Valor Atual</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                                    <span className="text-sm font-bold bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">R$</span>
                                                </div>
                                                <input
                                                    required={!isInstallmentMode}
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white font-semibold"
                                                    value={formData.amount}
                                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                    placeholder="0,00"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Juros (Valor)</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors">
                                                    <span className="text-sm font-bold bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">R$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-gray-900 dark:text-white font-semibold"
                                                    value={formData.interest_amount}
                                                    onChange={e => setFormData({ ...formData, interest_amount: e.target.value })}
                                                    placeholder="0,00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Section: Installment Config */
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-slate-700">Configuração de Parcelamento</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Valor Total da Dívida</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                                <span className="text-sm font-bold bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">R$</span>
                                            </div>
                                            <input
                                                required={isInstallmentMode}
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white font-semibold"
                                                value={instConfig.totalAmount}
                                                onChange={e => setInstConfig({ ...instConfig, totalAmount: e.target.value })}
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Quantidade de Parcelas</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-lg">format_list_numbered</span>
                                            </div>
                                            <input
                                                required={isInstallmentMode}
                                                type="number"
                                                min="1"
                                                max="120"
                                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white font-semibold"
                                                value={instConfig.installmentsCount}
                                                onChange={e => setInstConfig({ ...instConfig, installmentsCount: e.target.value })}
                                                placeholder="Ex: 10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Valor da Entrada (Opcional)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                                <span className="text-sm font-bold bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">R$</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white font-semibold"
                                                value={instConfig.downPayment}
                                                onChange={e => setInstConfig({ ...instConfig, downPayment: e.target.value })}
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Data da 1ª Parcela</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-lg">calendar_month</span>
                                            </div>
                                            <input
                                                required={isInstallmentMode}
                                                type="date"
                                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white appearance-none"
                                                value={instConfig.firstInstallmentDate}
                                                onChange={e => setInstConfig({ ...instConfig, firstInstallmentDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Recorrência das Parcelas</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Mensal', 'Quinzenal', 'Semanal'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setInstConfig({ ...instConfig, recurrenceType: type as any })}
                                                    className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border ${
                                                        instConfig.recurrenceType === type 
                                                        ? 'bg-primary/10 border-primary text-primary' 
                                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {previewInstallments.length > 0 && (
                                    <div className="mt-6 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                                        <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Preview das Parcelas</span>
                                            <span className="text-xs text-gray-500">{previewInstallments.length} parcelas</span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                                            {previewInstallments.map((inst, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{inst.installment_number}</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {new Date(inst.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        R$ {inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                            {!isInstallmentMode && (
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.is_recurring}
                                                onChange={e => setFormData({ ...formData, is_recurring: e.target.checked })}
                                            />
                                            <div className={`w-8 h-4 rounded-full transition-colors ${formData.is_recurring ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${formData.is_recurring ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-primary transition-colors">Cobrança Mensal Contínua</span>
                                    </label>
                                </div>
                            )}

                            <div className="flex items-center gap-4 ml-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitDisabled}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 transition-all transform active:scale-95"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">save_as</span>
                                    )}
                                    Salvar Dívida
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Lateral Summary Card for Installments */}
                    {isInstallmentMode && (
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 h-fit sticky top-28 hidden lg:block animate-in fade-in slide-in-from-right-4 duration-300">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">pie_chart</span>
                                Resumo do Parcelamento
                            </h4>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                                    <span className="text-xs text-gray-500">Valor Total</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        R$ {parseFloat(instConfig.totalAmount || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                                    <span className="text-xs text-gray-500">Valor da Entrada</span>
                                    <span className="text-sm font-bold text-emerald-500">
                                        - R$ {parseFloat(instConfig.downPayment || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                                    <span className="text-xs text-gray-500">Total Financiado</span>
                                    <span className="text-sm font-bold text-indigo-500">
                                        R$ {financedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                                    <span className="text-xs text-gray-500">Qtd. Parcelas</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {instConfig.installmentsCount || '0'}x
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                                    <span className="text-xs text-gray-500">Valor da Parcela</span>
                                    <span className="text-sm font-bold text-primary">
                                        R$ {previewInstallments.length > 0 ? previewInstallments[0].amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                                    </span>
                                </div>

                                <div className="pt-4">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs text-gray-500">Progresso Inicial</span>
                                        <span className="text-lg font-black text-primary">0%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div className="bg-primary h-2 rounded-full w-0"></div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 text-center">O progresso será atualizado conforme os pagamentos forem registrados no painel.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DebtFormModal;
