import React from 'react';
import { Debt, DebtStatus } from '../../types';
import { calculateInterest } from '../utils/finance';
import { Calendar, AlertCircle, RefreshCw, ChevronDown, ChevronUp, MessageCircle, Edit, TrendingUp, DollarSign, Trash2, UserX, Check, PieChart, Activity, Percent, ArrowUpRight } from 'lucide-react';

interface DebtItemRowProps {
    debt: Debt;
    onPay: (id: string) => void;
    onDelete: (id: string) => void;
    onPayInterest: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onWhatsAppClick: (debt: Debt) => void;
    onSpc?: (id: string) => void;
    onPayInstallment?: (debt: Debt, installment: any) => void;
    isSaving?: boolean;
}

const DebtItemRow: React.FC<DebtItemRowProps> = ({ debt, onPay, onDelete, onPayInterest, onEdit, onWhatsAppClick, onSpc, onPayInstallment, isSaving }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const today = React.useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const dueDate = React.useMemo(() => {
        if (!debt.dueDate) return new Date();
        const [year, month, day] = debt.dueDate.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [debt.dueDate]);

    const isPaid = debt.status === DebtStatus.PAID;
    const isOverdue = !isPaid && dueDate <= today;
    const interest = calculateInterest(debt);

    // Calculate days overdue
    const daysOverdue = React.useMemo(() => {
        if (!isOverdue) return 0;
        return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    }, [isOverdue, today, dueDate]);

    // Calculate months overdue
    const monthsOverdue = React.useMemo(() => {
        if (!isOverdue) return 0;
        const yearDiff = today.getFullYear() - dueDate.getFullYear();
        const monthDiff = today.getMonth() - dueDate.getMonth();
        return Math.max(0, yearDiff * 12 + monthDiff);
    }, [isOverdue, today, dueDate]);

    // Financial calculations
    const interestRate = debt.interestRate !== undefined ? debt.interestRate : 0.30;
    const interestPercentage = (interestRate * 100).toFixed(1);
    const totalAccumulatedInterest = React.useMemo(() => {
        if (isPaid || !isOverdue) return 0;
        const months = Math.max(1, monthsOverdue);
        if (debt.interestAmount !== undefined && debt.interestAmount > 0) {
            return debt.interestAmount * months;
        }
        return debt.amount * interestRate * months;
    }, [isPaid, isOverdue, monthsOverdue, debt.amount, debt.interestAmount, interestRate]);

    const totalUpdatedValue = debt.amount + (isPaid ? 0 : totalAccumulatedInterest);
    const profit = React.useMemo(() => {
        if (!isPaid) return 0;
        return Math.max(0, debt.amount - (debt.originalAmount || debt.amount));
    }, [isPaid, debt.amount, debt.originalAmount]);

    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    const dueDayStr = debt.dueDate ? debt.dueDate.split('-')[2] : '--';

    const installments = debt.installments || [];
    const paidInstallments = installments.filter(i => i.status === 'PAID').length;
    const totalInstallments = installments.length;
    const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

    return (
        <div className={`rounded-2xl border transition-all duration-200 group overflow-hidden ${isPaid
            ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20'
            : isOverdue
                ? 'bg-red-50/30 border-red-100 dark:bg-red-900/10 dark:border-red-900/20'
                : 'bg-white dark:bg-slate-900/80 border-slate-100 dark:border-slate-800'
            }`}>
            <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Section: Main Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => !isPaid && !isSaving && onPay(debt.id)}
                        disabled={isSaving || isPaid}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 shrink-0 transition-all ${isPaid
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                    >
                        {isPaid && <Check className="w-5 h-5 font-bold" />}
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">
                                #{debt.sequenceNumber?.toString().padStart(4, '0')}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isPaid ? 'text-emerald-500' : isOverdue ? 'text-red-500' : 'text-primary'
                                }`}>
                                {isPaid ? 'Liquidado' : isOverdue ? 'Atrasado' : 'Pendente'}
                            </span>
                            {debt.isInstallment && (
                                <span className="badge badge-primary">
                                    Parcelado
                                </span>
                            )}
                        </div>

                        <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                            {debt.customerName}
                        </h4>

                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-500 uppercase">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('pt-BR') : '-'}
                            </div>
                            {isOverdue && daysOverdue > 0 && (
                                <div className="text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {daysOverdue} d
                                </div>
                            )}
                            {debt.isRecurring && !debt.isInstallment && (
                                <div className="text-primary flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded-md">
                                    <RefreshCw className="w-3 h-3" />
                                    Fixo
                                </div>
                            )}
                        </div>

                        {/* Progress Bar for Installments */}
                        {debt.isInstallment && totalInstallments > 0 && (
                            <div className="mt-3 w-full max-w-xs">
                                <div className="flex justify-between text-[9px] font-bold mb-1 text-slate-500">
                                    <span>Progresso</span>
                                    <span>{paidInstallments} de {totalInstallments} pagas</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Financials & Actions */}
                <div className="flex flex-row items-center justify-between md:justify-end gap-6 md:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col md:items-end">
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-none font-mono">
                            <span className="text-[10px] font-bold mr-1">R$</span>
                            {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {interest > 0 && !isPaid && (
                            <div className="text-[10px] font-bold text-red-500 mt-1 flex items-center justify-end gap-1 font-mono">
                                <TrendingUp className="w-3 h-3" />
                                R$ {interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            title={isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                        >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>

                        {debt.whatsapp && (
                            <button
                                onClick={() => onWhatsAppClick(debt)}
                                className="w-8 h-8 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </button>
                        )}

                        {!isPaid ? (
                            <>
                                <button
                                    onClick={() => onEdit(debt)}
                                    disabled={isSaving}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>

                                {interest > 0 && (
                                    <button
                                        onClick={() => onPayInterest(debt.id)}
                                        className="h-8 px-3 text-[10px] font-black uppercase text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                                    >
                                        Juros
                                    </button>
                                )}

                                <button
                                    onClick={() => onPay(debt.id)}
                                    className="btn btn-primary h-8 px-4 text-[10px] shadow-primary/20"
                                >
                                    <DollarSign className="w-3.5 h-3.5 mr-1" /> Total
                                </button>

                                {onSpc && (
                                    <button
                                        onClick={() => onSpc(debt.id)}
                                        disabled={isSaving}
                                        className="w-8 h-8 flex items-center justify-center text-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-lg transition-colors"
                                        title="Negativar SPC"
                                    >
                                        <UserX className="w-4 h-4" />
                                    </button>
                                )}

                                <button
                                    onClick={() => onDelete(debt.id)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onDelete(debt.id)}
                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-4"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Expanded View */}
            {isExpanded && (
                <div className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 p-4">
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
                        Detalhamento Financeiro
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <DetailCard
                            icon={<PieChart />}
                            label="Valor Original"
                            value={formatCurrency(debt.originalAmount || debt.amount)}
                            color="blue"
                        />
                        <DetailCard
                            icon={<Percent />}
                            label={`Juros (${interestPercentage}%)`}
                            value={formatCurrency(totalAccumulatedInterest)}
                            color="red"
                        />
                        <DetailCard
                            icon={<DollarSign />}
                            label="Valor Atualizado"
                            value={formatCurrency(totalUpdatedValue)}
                            color="amber"
                        />
                        <DetailCard
                            icon={<ArrowUpRight />}
                            label="Lucro / Acréscimo"
                            value={formatCurrency(profit)}
                            color="emerald"
                        />
                        <DetailCard
                            icon={<Activity />}
                            label="Atraso"
                            value={`${monthsOverdue} meses`}
                            color={monthsOverdue > 0 ? "red" : "slate"}
                        />
                        <DetailCard
                            icon={<Calendar />}
                            label="Vencimento Dia"
                            value={dueDayStr}
                            color="indigo"
                        />
                        {debt.isRecurring && (
                            <DetailCard
                                icon={<RefreshCw />}
                                label="Recorrência"
                                value="Ativa"
                                color="purple"
                            />
                        )}
                        {debt.isInstallment && (
                            <DetailCard
                                icon={<Activity />}
                                label="Parcelas Pagas"
                                value={`${paidInstallments} / ${totalInstallments}`}
                                color="emerald"
                            />
                        )}
                    </div>

                    {debt.isInstallment && (
                        <>
                            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
                                Cronograma de Parcelas
                            </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {installments.map((inst, idx) => {
                            const isInstPaid = inst.status === 'PAID';
                            const instOverdue = !isInstPaid && new Date(inst.due_date) < today;
                            return (
                                <div
                                    key={inst.id || idx}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isInstPaid
                                        ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20'
                                        : instOverdue
                                            ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20'
                                            : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isInstPaid ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : instOverdue ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                                            }`}>
                                            {inst.installment_number}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-900 dark:text-slate-200 font-mono">
                                                R$ {inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(inst.due_date).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {isInstPaid ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Pago
                                                </span>
                                                <span className="text-[9px] text-slate-400">
                                                    {inst.payment_date ? new Date(inst.payment_date).toLocaleDateString('pt-BR') : ''}
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => onPayInstallment && onPayInstallment(debt, inst)}
                                                disabled={isSaving}
                                                className="btn bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 text-[10px] px-3 py-1.5"
                                            >
                                                Pagar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DebtItemRow;

const DetailCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        slate: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${colorClasses[color] || colorClasses.slate}`}>
                    {React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3" })}
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase truncate">
                    {label}
                </span>
            </div>
            <div className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">
                {value}
            </div>
        </div>
    );
};
