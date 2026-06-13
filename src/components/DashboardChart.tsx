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
        <div className="bg-white dark:bg-slate-800/80 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-[11px] text-slate-400">Comparativo mensal</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
                        <span className="text-[10px] font-medium text-slate-400">Recebido</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-amber-400 rounded-sm"></div>
                        <span className="text-[10px] font-medium text-slate-400">A Receber</span>
                    </div>
                    {children && <div className="ml-2">{children}</div>}
                </div>
            </div>

            <div className="h-48 md:h-56 flex items-end gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
                {data.map((item, idx) => (
                    <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1.5 h-full justify-end group relative">
                        <div className="w-full flex justify-center gap-0.5 md:gap-1 h-full items-end">
                            <div
                                className="w-2 md:w-3.5 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm transition-all duration-700 group-hover:brightness-110"
                                style={{ height: `${Math.max(2, (item.received / maxVal) * 100)}%`, animationDelay: `${idx * 50}ms` }}
                            />
                            <div
                                className="w-2 md:w-3.5 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-sm transition-all duration-700 group-hover:brightness-110"
                                style={{ height: `${Math.max(2, (item.toReceive / maxVal) * 100)}%`, animationDelay: `${idx * 50}ms` }}
                            />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 scale-95 group-hover:scale-100">
                            <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[10px] py-2 px-3 rounded-xl shadow-xl border border-white/10 whitespace-nowrap space-y-0.5">
                                <div><span className="text-emerald-400 font-semibold">Rec:</span> R$ {item.received.toLocaleString('pt-BR')}</div>
                                <div><span className="text-amber-400 font-semibold">Prev:</span> R$ {item.toReceive.toLocaleString('pt-BR')}</div>
                            </div>
                        </div>

                        <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 tracking-tight">{item.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardChart;
