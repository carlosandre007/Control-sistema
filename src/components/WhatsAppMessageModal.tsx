import React, { useState, useMemo, useEffect } from 'react';
import { Debt } from '../../types';

interface WhatsAppMessageModalProps {
    debt: Debt;
    onClose: () => void;
}

type TemplateType = 'direct' | 'human' | 'objective';

const WhatsAppMessageModal: React.FC<WhatsAppMessageModalProps> = ({ debt, onClose }) => {
    const [template, setTemplate] = useState<TemplateType>('direct');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const firstName = debt.customerName.split(' ')[0];

    const templates: Record<TemplateType, string> = {
        direct: `Olá ${firstName}! Tudo bem? Estou passando apenas para te lembrar de uma pendência que consta em nosso sistema. Para te ajudar a organizar, você prefere verificar as informações da "dívida total" ou dos "juros"? Responda aqui para eu te enviar os detalhes.`,
        human: `Oi ${firstName}, como vai? Espero que esteja bem. Temos um lembrete aqui sobre seu cadastro conosco e gostaria de saber como podemos te ajudar. Você prefere conversar sobre a "dívida total" ou sobre os "juros" no momento? Me dê um retorno por aqui para conversarmos melhor.`,
        objective: `Olá! Gostaria de falar sobre sua conta em aberto. Temos opções para você escolher entre resolver a "dívida total" ou o pagamento dos "juros". Qual dessas opções você prefere? Responda esta mensagem para receber mais detalhes.`
    };

    useEffect(() => {
        setMessage(templates[template]);
    }, [template, firstName]);

    const isValid = debt.customerName && debt.whatsapp;

    const handleSend = (protocol: 'web' | 'app') => {
        if (!isValid) return;

        setSending(true);
        const encodedMessage = encodeURIComponent(message);
        const phone = (debt.whatsapp || '').replace(/\D/g, '');

        let whatsappUrl = '';
        if (protocol === 'web') {
            whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        } else {
            whatsappUrl = `whatsapp://send?phone=${phone}&text=${encodedMessage}`;
        }

        window.open(whatsappUrl, '_blank');

        setTimeout(() => {
            setSending(false);
            onClose();
        }, 1000);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
        alert('Mensagem copiada!');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                            <span className="material-symbols-outlined">chat</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Mensagem Ética</h3>
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Lembrete Discreto WhatsApp</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Info Card */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <div className={`w-12 h-12 rounded-full ${debt.avatarColor} flex items-center justify-center text-white font-bold text-lg`}>
                            {debt.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400">Cliente</p>
                            <h4 className="font-bold text-gray-900 dark:text-white">{debt.customerName}</h4>
                            <p className="text-xs text-gray-500">{debt.whatsapp}</p>
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-gray-500 tracking-wider px-1">Selecione o Tom da Mensagem</label>
                        <div className="flex flex-wrap gap-2">
                            {(['direct', 'human', 'objective'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTemplate(t)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${template === t
                                            ? 'bg-green-500 text-white shadow-md shadow-green-500/20 scale-105'
                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {t === 'direct' ? 'Direto' : t === 'human' ? 'Humano' : 'Objetivo'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Preview */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Visualização da Mensagem</label>
                            <button onClick={copyToClipboard} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">content_copy</span> Copiar texto
                            </button>
                        </div>
                        <div className="p-4 bg-green-50/30 dark:bg-green-900/5 border-2 border-green-100 dark:border-green-900/20 rounded-2xl relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-32 bg-transparent border-none resize-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium focus:ring-0"
                            />
                            <div className="absolute -bottom-2 right-4 flex gap-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${debt.customerName ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'}`}>Nome: OK</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${debt.whatsapp ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'}`}>WhatsApp: OK</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-slate-900/20 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => handleSend('web')}
                        disabled={!isValid || sending}
                        className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isValid
                            ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed shadow-none'}`}
                    >
                        <span className="material-symbols-outlined">public</span>
                        {sending ? 'Abrindo...' : 'WhatsApp Web'}
                    </button>
                    <button
                        onClick={() => handleSend('app')}
                        disabled={!isValid || sending}
                        className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isValid
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed shadow-none'}`}
                    >
                        <span className="material-symbols-outlined">smartphone</span>
                        {sending ? 'Abrindo...' : 'WhatsApp App'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppMessageModal;
