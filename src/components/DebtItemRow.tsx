import React from 'react';
import { Debt, DebtStatus } from '../../types';
import { calculateInterest } from '../utils/finance';

interface DebtItemRowProps {
    debt: Debt;
    onPay: (id: string) => void;
    onDelete: (id: string) => void;
    onPayInterest: (id: string) => void;
    onEdit: (debt: Debt) => void;
    onWhatsAppClick: (debt: Debt) => void;
    onSpc?: (id: string) => void;
    isSaving?: boolean;
}

const DebtItemRow: React.FC<DebtItemRowProps> = ({ debt, onPay, onDelete, onPayInterest, onEdit, onWhatsAppClick, onSpc, isSaving }) => {
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
        // Interest per month * months overdue (minimum 1 if overdue)
        const months = Math.max(1, monthsOverdue);
        if (debt.interestAmount !== undefined && debt.interestAmount > 0) {
            return debt.interestAmount * months;
        }
        return debt.amount * interestRate * months;
    }, [isPaid, isOverdue, monthsOverdue, debt.amount, debt.interestAmount, interestRate]);

    const totalUpdatedValue = debt.amount + (isPaid ? 0 : totalAccumulatedInterest);
    const profit = React.useMemo(() => {
        if (!isPaid) return 0;
        // Profit = amount paid - original amount
        return Math.max(0, debt.amount - (debt.originalAmount || debt.amount));
    }, [isPaid, debt.amount, debt.originalAmount]);

    const dueDayStr = debt.dueDate ? debt.dueDate.split('-')[2] : '-';

    const statusLabel = isPaid ? 'Liquidado' : isOverdue ? 'Atrasado' : 'Em Dia';
    const statusColor = isPaid ? 'text-green-500' : isOverdue ? 'text-red-500' : 'text-blue-500';

    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return (
        <div className={`rounded-xl border transition-all duration-300 group ${isPaid
            ? 'bg-green-50/30 dark:bg-green-950/10 border-green-200/50 dark:border-green-900/20'
            : isOverdue
                ? 'bg-red-50/30 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/20'
                : 'bg-white dark:bg-slate-950 border-gray-100 dark:border-slate-900'
            }`}>

            {/* Main Row */}
            <div className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Section: Main Info */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <button
                            onClick={() => !isPaid && !isSaving && onPay(debt.id)}
                            disabled={isSaving}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 shrink-0 transition-colors ${isPaid
                                ? 'bg-success border-success text-white'
                                : 'border-gray-200 dark:border-slate-800 bg-transparent hover:border-primary'
                                }`}
                        >
                            {isPaid && <span className="material-symbols-outlined text-base font-bold">check</span>}
                        </button>

                        {/* Due Day Badge */}
                        <div className={`flex flex-col items-center justify-center rounded-xl p-2 w-12 h-12 shrink-0 border transition-colors ${isPaid
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30'
                            : isOverdue
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
                                : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800'
                            }`}>
                            <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Dia</span>
                            <span className={`text-lg font-black leading-none ${isPaid ? 'text-green-500' : isOverdue ? 'text-red-500' : 'text-primary'}`}>
                                {dueDayStr}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[9px] font-bold text-gray-400 font-mono tracking-tighter">
                                    #{debt.sequenceNumber?.toString().padStart(4, '0')}
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${statusColor}`}>
                                    {statusLabel}
                                </span>
                            </div>

                            {/* Clickable Customer Name - Expand/Collapse */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-left w-full group/name"
                            >
                                <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate group-hover/name:text-primary transition-colors flex items-center gap-1.5">
                                    {debt.customerName}
                                    <span className={`material-symbols-outlined text-xs text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </h4>
                            </button>

                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">event</span>
                                    {debt.dueDate ? new Date(debt.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                                </div>
                                {isOverdue && daysOverdue > 0 && (
                                    <div className="text-red-500 flex items-center gap-1" title={`${daysOverdue} dias em atraso (${monthsOverdue} meses)`}>
                                        <span className="material-symbols-outlined text-xs">priority_high</span>
                                        {daysOverdue}d
                                    </div>
                                )}
                                {debt.isRecurring && (
                                    <div className="text-primary flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">sync</span>
                                        Fixo
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Financials & Actions */}
                    <div className="flex flex-row items-center justify-between md:justify-end gap-6 md:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50 dark:border-slate-900">
                        <div className="flex flex-col md:items-end">
                            <div className="text-lg font-black text-gray-900 dark:text-white leading-none" title={`Valor original: ${formatCurrency(debt.originalAmount || debt.amount)}`}>
                                <span className="text-[10px] font-bold mr-1">R$</span>
                                {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            {interest > 0 && !isPaid && (
                                <div className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1 cursor-help"
                                    title={`Juros: ${interestPercentage}% ao mês sobre R$ ${debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}>
                                    <span className="material-symbols-outlined text-[10px]">add</span>
                                    R$ {interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            {debt.whatsapp && (
                                <button
                                    onClick={() => onWhatsAppClick(debt)}
                                    className="w-8 h-8 flex items-center justify-center text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                                    title="WhatsApp"
                                >
                                    <span className="material-symbols-outlined text-lg">chat</span>
                                </button>
                            )}

                            {!isPaid ? (
                                <>
                                    <button
                                        onClick={() => onEdit(debt)}
                                        disabled={isSaving}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>

                                    {interest > 0 && (
                                        <button
                                            onClick={() => onPayInterest(debt.id)}
                                            className="h-8 px-3 text-[10px] font-black uppercase text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                                        >
                                            Juros
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onPay(debt.id)}
                                        className="h-8 px-4 text-[10px] font-black uppercase bg-success hover:bg-green-600 text-white rounded-lg transition-all shadow-sm active:scale-95"
                                    >
                                        Pagar
                                    </button>

                                    {onSpc && (
                                        <button
                                            onClick={() => onSpc(debt.id)}
                                            disabled={isSaving}
                                            className="w-8 h-8 flex items-center justify-center text-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-lg transition-colors"
                                            title="Negativar SPC"
                                        >
                                            <span className="material-symbols-outlined text-lg">person_off</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onDelete(debt.id)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => onDelete(debt.id)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
                                    title="Excluir"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Details Section */}
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxHeight: isExpanded ? '600px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                }}
            >
                <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                    <div className="border-t border-dashed border-gray-200 dark:border-slate-800 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

                            {/* Data de Vencimento */}
                            <DetailCard
                                icon="event"
                                label="Vencimento"
                                value={debt.dueDate ? new Date(debt.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                                color="text-gray-700 dark:text-slate-300"
                            />

                            {/* Data de Registro */}
                            <DetailCard
                                icon="calendar_today"
                                label="Data Registro"
                                value={debt.registrationDate ? new Date(debt.registrationDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                                color="text-gray-700 dark:text-slate-300"
                            />

                            {/* Status */}
                            <DetailCard
                                icon="info"
                                label="Status"
                                value={statusLabel}
                                color={statusColor}
                            />

                            {/* Dias em Atraso */}
                            <DetailCard
                                icon="timer"
                                label="Dias em Atraso"
                                value={isOverdue ? `${daysOverdue} dias` : 'Em dia'}
                                color={isOverdue ? 'text-red-500' : 'text-green-500'}
                            />

                            {/* Meses em Atraso */}
                            <DetailCard
                                icon="date_range"
                                label="Meses em Atraso"
                                value={isOverdue ? `${monthsOverdue} ${monthsOverdue === 1 ? 'mês' : 'meses'}` : '-'}
                                color={isOverdue ? 'text-red-500' : 'text-gray-500'}
                            />

                            {/* Valor Original */}
                            <DetailCard
                                icon="receipt"
                                label="Valor Original"
                                value={formatCurrency(debt.originalAmount || debt.amount)}
                                color="text-gray-700 dark:text-slate-300"
                                tooltip="Valor original da dívida no momento do registro"
                            />

                            {/* Valor Atual */}
                            <DetailCard
                                icon="payments"
                                label="Valor Atual"
                                value={formatCurrency(debt.amount)}
                                color="text-gray-700 dark:text-slate-300"
                            />

                            {/* Taxa de Juros */}
                            <DetailCard
                                icon="percent"
                                label="Juros / Mês"
                                value={`${interestPercentage}% (${formatCurrency(debt.amount * interestRate)})`}
                                color="text-orange-500"
                                tooltip={`Taxa de ${interestPercentage}% aplicada sobre o valor de ${formatCurrency(debt.amount)} ao mês`}
                            />

                            {/* Total Juros Acumulados */}
                            {isOverdue && !isPaid && (
                                <DetailCard
                                    icon="trending_up"
                                    label="Juros Acumulados"
                                    value={formatCurrency(totalAccumulatedInterest)}
                                    color="text-red-500"
                                    tooltip={`${interestPercentage}% x ${Math.max(1, monthsOverdue)} meses = ${formatCurrency(totalAccumulatedInterest)}`}
                                />
                            )}

                            {/* Valor Total Atualizado */}
                            {!isPaid && (
                                <DetailCard
                                    icon="account_balance"
                                    label="Total Atualizado"
                                    value={formatCurrency(totalUpdatedValue)}
                                    color="text-lg font-black text-gray-900 dark:text-white"
                                    tooltip={`Valor (${formatCurrency(debt.amount)}) + Juros (${formatCurrency(totalAccumulatedInterest)})`}
                                    highlight
                                />
                            )}

                            {/* Lucro (para pagos) */}
                            {isPaid && profit > 0 && (
                                <DetailCard
                                    icon="savings"
                                    label="Lucro Gerado"
                                    value={formatCurrency(profit)}
                                    color="text-green-500"
                                    tooltip="Diferença entre valor recebido e valor original da dívida"
                                    highlight
                                />
                            )}

                            {/* Data de Pagamento */}
                            {isPaid && debt.paymentDate && (
                                <DetailCard
                                    icon="check_circle"
                                    label="Data Pagamento"
                                    value={new Date(debt.paymentDate).toLocaleDateString('pt-BR')}
                                    color="text-green-500"
                                />
                            )}

                            {/* Descrição */}
                            {debt.description && (
                                <div className="col-span-2 md:col-span-3 lg:col-span-4">
                                    <DetailCard
                                        icon="description"
                                        label="Descrição"
                                        value={debt.description}
                                        color="text-gray-600 dark:text-slate-400"
                                    />
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for detail cards inside the expandable area
const DetailCard: React.FC<{
    icon: string;
    label: string;
    value: string;
    color: string;
    tooltip?: string;
    highlight?: boolean;
}> = ({ icon, label, value, color, tooltip, highlight }) => (
    <div
        className={`flex items-start gap-2.5 p-3 rounded-lg transition-colors ${highlight
            ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20'
            : 'bg-gray-50/80 dark:bg-slate-900/50'
            }`}
        title={tooltip}
    >
        <span className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${highlight ? 'text-primary' : 'text-gray-400'}`}>{icon}</span>
        <div className="min-w-0">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
            <div className={`text-xs font-bold ${color} break-words`}>{value}</div>
        </div>
    </div>
);

export default DebtItemRow;
