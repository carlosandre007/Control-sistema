import React, { useState, useMemo } from 'react';
import { Debt, DebtStatus, Transaction } from '../../types';
import { isOverdue, calculateDaysOverdue } from '../utils/status';
import { calculateInterest } from '../utils/finance';
import {
    X,
    TrendingUp,
    Calendar,
    DollarSign,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ArrowRight,
    MessageCircle,
    Download,
    History,
    FileText
} from 'lucide-react';

interface CustomerPanelViewProps {
    customerCode: string;
    debts: Debt[];
    transactions: Transaction[];
    onClose: () => void;
    onPay: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onPayInterest: (id: string) => void;
    onWhatsApp: (debt: Debt) => void;
}

const CustomerPanelView: React.FC<CustomerPanelViewProps> = ({
    customerCode,
    debts,
    transactions,
    onClose,
    onPay,
    onEdit,
    onPayInterest,
    onWhatsApp
}) => {
    const [activeTab, setActiveTab] = useState<'payments' | 'interest' | 'report'>('payments');

    const customerDebts = useMemo(() => debts.filter(d => d.customerCode === customerCode), [debts, customerCode]);
    const customerTransactions = useMemo(() => transactions.filter(t => t.chargeId && customerDebts.some(d => d.id === t.chargeId)), [transactions, customerDebts]);

    const name = customerDebts[0]?.customerName || 'Cliente';
    const document = customerDebts[0]?.customerDocument || 'Não informado';
    const whatsapp = customerDebts[0]?.whatsapp || 'Não informado';
    const avatarColor = customerDebts[0]?.avatarColor || 'bg-primary';

    // KPIs
    const totalOpen = customerDebts.filter(d => d.status !== DebtStatus.PAID).reduce((sum, d) => sum + d.amount, 0);
    const totalOverdue = customerDebts.filter(d => d.status !== DebtStatus.PAID && isOverdue(d.dueDate)).reduce((sum, d) => sum + d.amount, 0);
    const accumulatedProfit = customerTransactions.filter(t => t.type === 'interest_payment').reduce((sum, t) => sum + t.amount, 0);

    // Calculate Average Delay
    const paidTransactions = customerTransactions.filter(t => t.type === 'total_payment');
    const totalDelayDays = paidTransactions.reduce((acc, t) => {
        const debt = customerDebts.find(d => d.id === t.chargeId);
        if (debt && t.transactionDate > debt.dueDate) {
            const delay = Math.ceil((new Date(t.transactionDate).getTime() - new Date(debt.dueDate).getTime()) / (1000 * 60 * 60 * 24));
            return acc + delay;
        }
        return acc;
    }, 0);
    const avgDelay = paidTransactions.length > 0 ? Math.round(totalDelayDays / paidTransactions.length) : 0;

    // Status logic
    const hasOverdue = customerDebts.some(d => d.status !== DebtStatus.PAID && isOverdue(d.dueDate));
    const maxDelay = Math.max(...customerDebts.filter(d => d.status !== DebtStatus.PAID && isOverdue(d.dueDate)).map(d => calculateDaysOverdue(d.dueDate)), 0);

    // Chart Data (Last 6 Months)
    const chartData = useMemo(() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const label = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
            const prefix = date.toISOString().slice(0, 7);

            const value = customerTransactions
                .filter(t => t.transactionDate.startsWith(prefix))
                .reduce((sum, t) => sum + t.amount, 0);

            months.push({ label, value });
        }
        return months;
    }, [customerTransactions]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start">
                    <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-2xl ${avatarColor} flex items-center justify-center text-white ring-4 ring-gray-50 dark:ring-slate-800 shadow-lg`}>
                            <span className="text-2xl font-black">{name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{name}</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{document}</span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span className="text-xs font-bold text-primary flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    {whatsapp}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Alerta Inteligente */}
                    <div className={`p-4 rounded-2xl flex items-center gap-3 border ${hasOverdue ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        {hasOverdue ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        <span className="text-sm font-bold uppercase tracking-wide">
                            {hasOverdue ? `Cliente está com ${maxDelay} dias de atraso` : 'Cliente em dia'}
                        </span>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total em Aberto', value: totalOpen, icon: DollarSign, color: 'text-primary bg-primary/10' },
                            { label: 'Total em Atraso', value: totalOverdue, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
                            { label: 'Lucro Acumulado', value: accumulatedProfit, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50' },
                            { label: 'Média de Atraso', value: `${avgDelay} dias`, icon: Clock, color: 'text-amber-500 bg-amber-50' },
                        ].map((kpi, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                                    <kpi.icon className="w-4 h-4" />
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</div>
                                <div className="text-sm font-black text-gray-900 dark:text-white">
                                    {typeof kpi.value === 'number' ? `R$ ${kpi.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : kpi.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Debt Table */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-l-4 border-primary pl-3">Dívidas Ativas</h3>
                        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-black uppercase text-[9px]">
                                    <tr>
                                        <th className="px-6 py-4">Descrição</th>
                                        <th className="px-6 py-4 text-center">Vencimento</th>
                                        <th className="px-6 py-4 text-center">Valor</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {customerDebts
                                        .filter(d => d.status !== DebtStatus.PAID)
                                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                        .map(debt => {
                                            const overdue = isOverdue(debt.dueDate);
                                            const days = calculateDaysOverdue(debt.dueDate);
                                            return (
                                                <tr key={debt.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white">{debt.description || 'Dívida Sem Descrição'}</div>
                                                        <div className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${overdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                            {overdue ? `${days} dias de atraso` : 'Em dia'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-500">{new Date(debt.dueDate).toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-6 py-4 text-center font-black text-gray-900 dark:text-white">R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 text-[10px] font-black uppercase">
                                                            <button
                                                                onClick={() => onEdit(debt)}
                                                                className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-primary transition-colors rounded"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => onPayInterest(debt.id)}
                                                                className="px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                                                            >
                                                                Juros
                                                            </button>
                                                            <button
                                                                onClick={() => onPay(debt.id)}
                                                                className="px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                                                            >
                                                                Total
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Simple Chart */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Pagamentos (Últimos 6 meses)</h3>
                        <div className="h-40 flex items-end justify-between gap-3 px-2">
                            {chartData.map((d, i) => {
                                const maxVal = Math.max(...chartData.map(cd => cd.value), 100);
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div
                                            className="w-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-all rounded-t-lg relative"
                                            style={{ height: `${(d.value / maxVal) * 100}%` }}
                                        >
                                            {d.value > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    R${d.value}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">{d.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="space-y-4 pt-4">
                        <div className="flex gap-2 border-b border-gray-100 dark:border-slate-800">
                            {[
                                { id: 'payments', label: 'Pagamentos', icon: History },
                                { id: 'interest', label: 'Juros / Renovação', icon: Calendar },
                                { id: 'report', label: 'Relatório', icon: FileText },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTab === 'payments' && (
                                <div className="bg-gray-50 dark:bg-slate-800/30 rounded-2xl p-4">
                                    <table className="w-full text-left text-[11px]">
                                        <thead className="text-gray-400 font-black uppercase text-[9px]">
                                            <tr>
                                                <th className="pb-3 px-2">Data</th>
                                                <th className="pb-3 px-2">Tipo</th>
                                                <th className="pb-3 px-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerTransactions.map(t => (
                                                <tr key={t.id} className="border-t border-gray-100 dark:border-slate-800">
                                                    <td className="py-3 px-2 font-medium">{new Date(t.transactionDate).toLocaleDateString('pt-BR')}</td>
                                                    <td className="py-3 px-2 uppercase font-bold text-[9px]">
                                                        {t.type === 'total_payment' ? <span className="text-emerald-500">Total</span> : <span className="text-amber-500">Juros</span>}
                                                    </td>
                                                    <td className="py-3 px-2 text-right font-black">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                            {customerTransactions.length === 0 && (
                                                <tr><td colSpan={3} className="py-8 text-center text-gray-400 font-bold italic">Nenhum pagamento registrado</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'interest' && (
                                <div className="bg-gray-50 dark:bg-slate-800/30 rounded-2xl p-4">
                                    <table className="w-full text-left text-[11px]">
                                        <thead className="text-gray-400 font-black uppercase text-[9px]">
                                            <tr>
                                                <th className="pb-3 px-2">Data Renovação</th>
                                                <th className="pb-3 px-2">Valor Juros</th>
                                                <th className="pb-3 px-2 text-right">Novo Vencimento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerTransactions.filter(t => t.type === 'interest_payment').map(t => (
                                                <tr key={t.id} className="border-t border-gray-100 dark:border-slate-800">
                                                    <td className="py-3 px-2 font-medium">{new Date(t.transactionDate).toLocaleDateString('pt-BR')}</td>
                                                    <td className="py-3 px-2 font-black">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-3 px-2 text-right font-bold text-primary">Próximo Mês</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'report' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Total Pago', value: customerTransactions.reduce((s, t) => s + t.amount, 0), color: 'text-emerald-500' },
                                        { label: 'Total Quitado', value: customerTransactions.filter(t => t.type === 'total_payment').length, unit: 'títulos' },
                                        { label: 'Total de Juros', value: accumulatedProfit, color: 'text-amber-500' },
                                        { label: 'Encerradas', value: customerDebts.filter(d => d.status === DebtStatus.PAID).length, unit: 'dívidas' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</div>
                                            <div className={`text-xl font-black ${item.color || 'text-gray-900 dark:text-white'}`}>
                                                {typeof item.value === 'number' && !item.unit ? `R$ ${item.value.toLocaleString('pt-BR')}` : `${item.value} ${item.unit || ''}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 border-t border-gray-100 dark:border-slate-800 flex justify-center">
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black rounded-xl uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <ArrowRight className="w-4 h-4" />
                        Relatório PDF em Breve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerPanelView;
