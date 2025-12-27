import React, { useState, useEffect } from 'react';
import { Debt, DebtStatus } from '../../types';
import { supabase } from '../utils/supabase';

interface DebtFormModalProps {
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    editingDebt?: Debt | null;
}

const DebtFormModal: React.FC<DebtFormModalProps> = ({ onClose, onSuccess, userId, editingDebt }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_code: '',
        whatsapp: '',
        amount: '',
        registration_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: DebtStatus.UP_TO_DATE,
        interest_amount: '0',
        avatar_color: 'bg-primary',
        is_recurring: true
    });

    useEffect(() => {
        if (editingDebt) {
            setFormData({
                customer_name: editingDebt.customerName,
                customer_code: editingDebt.customerCode,
                whatsapp: editingDebt.whatsapp || '',
                amount: editingDebt.amount.toString(),
                registration_date: editingDebt.registrationDate || new Date().toISOString().split('T')[0],
                due_date: editingDebt.dueDate,
                status: editingDebt.status,
                interest_amount: (editingDebt.interestAmount || 0).toString(),
                avatar_color: editingDebt.avatarColor || 'bg-primary',
                is_recurring: editingDebt.isRecurring
            });
        } else {
            const fetchNextCode = async () => {
                const { data, error } = await supabase
                    .from('debts')
                    .select('customer_code')
                    .eq('user_id', userId);

                if (data && !error) {
                    const uniqueCodes = Array.from(new Set(data.map(d => {
                        const match = d.customer_code.match(/\d+/);
                        return match ? parseInt(match[0]) : 0;
                    })));
                    const maxCode = uniqueCodes.length > 0 ? Math.max(...uniqueCodes) : 0;
                    const nextCode = (maxCode + 1).toString().padStart(4, '0');
                    setFormData(prev => ({ ...prev, customer_code: `#${nextCode}` }));
                }
            };
            fetchNextCode();
        }
    }, [userId, editingDebt]);

    const handleRegistrationDateChange = (date: string) => {
        const regDate = new Date(date);
        const dueDate = new Date(regDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        setFormData({
            ...formData,
            registration_date: date,
            due_date: dueDate.toISOString().split('T')[0]
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
                user_id: userId
            };

            console.log('Enviando payload:', payload);

            if (editingDebt) {
                console.log('Modo de edição: Atualizando registro existente...');
                const { data, error } = await supabase
                    .from('debts')
                    .update(payload)
                    .eq('id', editingDebt.id)
                    .select();

                if (error) throw error;

                // Cascade update if name changed
                if (formData.customer_name !== editingDebt.customerName) {
                    console.log('Detectada mudança de nome, atualizando outros registros com o mesmo código...');
                    const { error: cascadeError } = await supabase
                        .from('debts')
                        .update({ customer_name: formData.customer_name })
                        .eq('customer_code', editingDebt.customerCode)
                        .eq('user_id', userId);

                    if (cascadeError) {
                        console.error('Erro ao atualizar nomes em cascata:', cascadeError);
                        // Decide if you want to throw this error or just log it
                    } else {
                        console.log('Nomes atualizados em cascata com sucesso.');
                    }
                }

                console.log('Update result:', data);
                alert('Registro atualizado com sucesso!');
            } else {
                console.log('Modo de criação: Inserindo novo registro...');
                const { error } = await supabase
                    .from('debts')
                    .insert([payload]);
                if (error) throw error;
                alert('Novo registro criado com sucesso!');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                        {editingDebt ? 'Editar Registro' : 'Novo Registro de Dívida'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><span className="material-symbols-outlined">close</span></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Nome do Cliente</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white"
                                value={formData.customer_name}
                                onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                placeholder="Digite o nome completo"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Código do Cliente (Auto)</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white font-mono"
                                value={formData.customer_code}
                                onChange={e => setFormData({ ...formData, customer_code: e.target.value })}
                                placeholder="#0000"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">WhatsApp</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white font-bold"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    placeholder="(00) 00000-0000"
                                />
                                {formData.whatsapp && (
                                    <a
                                        href={`https://wa.me/${formData.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center shadow-sm"
                                        title="Testar WhatsApp"
                                    >
                                        <span className="material-symbols-outlined text-base">chat</span>
                                    </a>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Valor da Dívida (R$)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white font-bold"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0,00"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Valor do Juros (R$)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white font-bold text-red-500"
                                value={formData.interest_amount}
                                onChange={e => setFormData({ ...formData, interest_amount: e.target.value })}
                                placeholder="0,00"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Data de Registro</label>
                            <input
                                required
                                type="date"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white font-bold"
                                value={formData.registration_date}
                                onChange={e => handleRegistrationDateChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Vencimento (Editável)</label>
                            <input
                                required
                                type="date"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white font-bold"
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Status do Título</label>
                            <select
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 dark:text-white font-bold"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as DebtStatus })}
                            >
                                <option value={DebtStatus.UP_TO_DATE}>Em Dia</option>
                                <option value={DebtStatus.PENDING}>Pendente</option>
                                <option value={DebtStatus.OVERDUE}>Atrasado</option>
                                <option value={DebtStatus.PAID}>Pago</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.amount || !formData.customer_name}
                            className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-indigo-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                            {editingDebt ? 'Atualizar Registro' : 'Salvar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DebtFormModal;
