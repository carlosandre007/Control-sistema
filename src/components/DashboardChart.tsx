import React from 'react';

interface ChartData {
    month: string;
    received: number;
    toReceive: number;
}

interface DashboardChartProps {
    data: ChartData[];
    title: string;
    children?: React.ReactNode;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data, title, children }) => {
    const maxVal = Math.max(...data.flatMap(d => [d.received, d.toReceive]), 1000);

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Comparativo mensal de recebimentos</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-slate-500">Recebido</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-slate-500">A Receber</span>
                    </div>
                </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative hover:z-20 transition-all">
                        <div className="w-full flex justify-center gap-1 h-full items-end pb-2">
                            {/* Received Bar */}
                            <div
                                className="w-2 md:w-4 bg-emerald-500 rounded-t-sm transition-all duration-500 relative group-hover:brightness-110"
                                style={{ height: `${(item.received / maxVal) * 100}%` }}
                            />
                            {/* To Receive Bar */}
                            <div
                                className="w-2 md:w-4 bg-amber-400 rounded-t-sm transition-all duration-500 relative group-hover:brightness-110"
                                style={{ height: `${(item.toReceive / maxVal) * 100}%` }}
                            />
                        </div>

                        {/* Combined Tooltips at the top of the group */}
                        <div className="absolute bottom-full mb-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap scale-95 group-hover:scale-100">
                            <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[10px] py-1 px-2 rounded-lg shadow-xl border border-white/10">
                                <span className="text-emerald-400 font-bold">Rec:</span> R$ {item.received.toLocaleString('pt-BR')}
                            </div>
                            <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[10px] py-1 px-2 rounded-lg shadow-xl border border-white/10">
                                <span className="text-amber-400 font-bold">Previsão:</span> R$ {item.toReceive.toLocaleString('pt-BR')}
                            </div>
                        </div>

                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.month}</span>
                    </div>
                ))}
            </div>

            {children && (
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-700/50 flex justify-end">
                    {children}
                </div>
            )}
        </div>
    );
};

export default DashboardChart;
