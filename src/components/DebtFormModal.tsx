import React, { useState, useEffect, useCallback } from 'react';
import { Debt, DebtStatus } from '../../types';
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
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_code: '',
        whatsapp: '',
        amount: '',
        registration_date: formatDateToISO(new Date()),
        due_date: getNextMonthDate(formatDateToISO(new Date())),
        status: DebtStatus.UP_TO_DATE,
        interest_amount: '0',
        avatar_color: 'bg-primary',
        is_recurring: true,
        category: 'Serviços',
        description: ''
    });

    // ... inside fetchClients useEffect ...
    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase
                .from('debts')
                .select('customer_name, customer_code, whatsapp, avatar_color')
                .eq('user_id', userId);

            if (data && !error) {
                const uniqueClientsMap = new Map<string, ClientSuggestion>();
                data.forEach(d => {
                    if (!uniqueClientsMap.has(d.customer_code)) {
                        uniqueClientsMap.set(d.customer_code, {
                            customer_name: d.customer_name,
                            customer_code: d.customer_code,
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
                whatsapp: editingDebt.whatsapp || '',
                amount: editingDebt.amount.toString(),
                registration_date: editingDebt.registrationDate || formatDateToISO(new Date()),
                due_date: editingDebt.dueDate,
                status: editingDebt.status,
                interest_amount: (editingDebt.interestAmount || 0).toString(),
                avatar_color: editingDebt.avatarColor || 'bg-primary',
                is_recurring: editingDebt.isRecurring,
                category: editingDebt.category || 'Serviços',
                description: editingDebt.description || ''
            });
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

    // Debounced search for clients
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
            // First try to search in the 'clients' table (preferred)
            // If that fails (migration not run), fall back to 'debts' table
            let { data, error } = await supabase
                .from('clients')
                .select('name, customer_code, whatsapp, avatar_color')
                .ilike('name', `%${query}%`)
                .limit(5);

            if (error) {
                // Fallback to debts
                const { data: debtsData, error: debtsError } = await supabase
                    .from('debts')
                    .select('customer_name, customer_code, whatsapp, avatar_color')
                    .ilike('customer_name', `%${query}%`)
                    .limit(20);

                if (debtsError) throw debtsError;

                // Uniquify by customer_code
                const unique = new Map();
                (debtsData || []).forEach(d => {
                    if (!unique.has(d.customer_code)) {
                        unique.set(d.customer_code, {
                            customer_name: d.customer_name,
                            customer_code: d.customer_code,
                            whatsapp: d.whatsapp,
                            avatar_color: d.avatar_color
                        });
                    }
                });
                setFilteredClients(Array.from(unique.values()) as ClientSuggestion[]);
            } else {
                setFilteredClients((data || []).map(c => ({
                    customer_name: c.name,
                    customer_code: c.customer_code,
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

        // Exact match check for auto-fill (non-debounced for instant feel if known)
        if (!isWhatsappManual && value.length > 2) {
            const exactMatch = filteredClients.find(
                client => client.customer_name.toLowerCase() === value.trim().toLowerCase()
            );

            if (exactMatch) {
                setFormData(prev => ({
                    ...prev,
                    whatsapp: exactMatch.whatsapp || '',
                    customer_code: exactMatch.customer_code,
                    avatar_color: exactMatch.avatar_color
                }));
                setShowWhatsappHint(!exactMatch.whatsapp);
            }
        }
    };

    const handleSelectClient = (client: ClientSuggestion) => {
        setFormData({
            ...formData,
            customer_name: client.customer_name,
            customer_code: client.customer_code,
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                customer_name: formData.customer_name,
                customer_code: formData.customer_code,
                whatsapp: formData.whatsapp,
                amount: parseFloat(formData.amount),
                registration_date: formData.registration_date,
                due_date: formData.due_date,
                status: formData.status,
                interest_amount: parseFloat(formData.interest_amount),
                avatar_color: formData.avatar_color,
                is_recurring: formData.is_recurring,
                category: formData.category,
                description: formData.description,
                user_id: userId
            };

            if (editingDebt) {
                const { error } = await supabase
                    .from('debts')
                    .update(payload)
                    .eq('id', editingDebt.id);

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
                const { error } = await supabase
                    .from('debts')
                    .insert([payload]);
                if (error) throw error;
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                {/* Header Section */}
                <div className="px-8 pt-8 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Voltar para Dívidas
                        </button>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                                <span className="material-symbols-outlined text-lg">help</span> Ajuda
                            </button>
                            <div className="relative">
                                <span className="material-symbols-outlined text-gray-400">notifications</span>
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cadastro de Dívida</h2>
                    <p className="text-sm text-gray-400 mt-1">Preencha os dados abaixo para registrar uma nova pendência financeira.</p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-8">
                    {/* Section 1: Client Information */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-slate-700">Informações do Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Nome do Cliente</label>
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
                                        placeholder="Ex: João Silva"
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
                                    {showWhatsappHint && (
                                        <div className="absolute -bottom-5 left-0 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-300">
                                            <span className="material-symbols-outlined text-[10px] text-amber-500">info</span>
                                            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Cliente sem WhatsApp cadastrado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Dates and Deadlines */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-slate-700">Datas e Prazos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Data da Dívida</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                    </div>
                                    <input
                                        required
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
                                        required
                                        type="date"
                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-gray-900 dark:text-white appearance-none"
                                        value={formData.due_date}
                                        onChange={e => handleDueDateChange(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Values */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-slate-700">Valores</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Valor Real Total</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                        <span className="text-sm font-bold bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">R$</span>
                                    </div>
                                    <input
                                        required
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
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Valor do Juros</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                        <span className="text-sm font-bold bg-red-100 dark:bg-red-900/30 text-red-500 px-1.5 py-0.5 rounded">R$</span>
                                    </div>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all text-gray-900 dark:text-white font-semibold"
                                        value={formData.interest_amount}
                                        onChange={e => setFormData({ ...formData, interest_amount: e.target.value })}
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hidden/Advanced Section for internal needs */}
                    <div className="pt-2 flex items-center justify-between">
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
                                <span className="text-xs font-bold text-gray-500 group-hover:text-primary transition-colors">Cobrança Recurrente</span>
                            </label>

                            <div className="flex items-center gap-2 group cursor-default">
                                <span className="material-symbols-outlined text-sm text-gray-300 group-hover:text-primary transition-colors">tag</span>
                                <span className="text-[10px] font-mono text-gray-400 group-hover:text-primary transition-colors">{formData.customer_code}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.amount || !formData.customer_name}
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
            </div>
        </div>
    );
};

export default DebtFormModal;
