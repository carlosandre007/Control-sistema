import React from 'react';
import { Debt } from '../../types';

interface TimelineChartProps {
    transactions: any[];
    debts: Debt[];
    year: number;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ transactions, debts, year }) => {
    const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const data = months.map((_, index) => {
        const monthPrefix = `${year}-${(index + 1).toString().padStart(2, '0')}`;

        // Received in this month
        const received = transactions
            .filter((t) =>
                (t.type === 'total_payment' || t.type === 'partial_payment' || t.type === 'interest_payment') &&
                t.transaction_date.startsWith(monthPrefix)
            )
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Expected in this month (not paid)
        const expected = debts
            .filter((d) => {
                if (!d.dueDate.startsWith(monthPrefix)) return false;
                // Consider unpaid or partially paid as "to receive"
                return d.status !== 'PAID';
            })
            .reduce((sum, d) => sum + d.amount, 0);

        return { received, expected };
    });

    const maxVal = Math.max(...data.map(d => Math.max(d.received, d.expected)), 1000);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">timeline</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Linha do Tempo Anual</h3>
                        <p className="text-xs text-gray-500">Comparativo mensal de recebimentos vs. previsão</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <span className="text-gray-500">Recebido</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                        <span className="text-gray-500">A Receber</span>
                    </div>
                </div>
            </div>

            <div className="relative h-64 flex items-end justify-between gap-2 px-2">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-gray-100 dark:border-slate-700">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="border-t border-gray-50 dark:border-slate-700/50 w-full h-0"></div>
                    ))}
                </div>

                {data.map((monthData, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        <div className="flex gap-1 items-end w-full h-full max-h-[180px]">
                            {/* Received Bar */}
                            <div
                                className="flex-1 bg-success/80 hover:bg-success rounded-t-sm transition-all duration-500 relative group/bar"
                                style={{ height: `${(monthData.received / maxVal) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    R$ {monthData.received.toLocaleString()}
                                </div>
                            </div>
                            {/* Expected Bar */}
                            <div
                                className="flex-1 bg-warning/80 hover:bg-warning rounded-t-sm transition-all duration-500 relative group/bar"
                                style={{ height: `${(monthData.expected / maxVal) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    R$ {monthData.expected.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary transition-colors">{months[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimelineChart;
