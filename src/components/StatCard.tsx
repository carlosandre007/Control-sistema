import React from 'react';
import * as Icons from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: keyof typeof Icons;
    footer?: string;
    secondaryValue?: string;
    color: 'danger' | 'warning' | 'primary' | 'success' | 'info';
    action?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, footer, secondaryValue, color, action }) => {
    const IconComponent = Icons[icon] as React.ElementType;

    const colorConfig = {
        danger: {
            iconBg: 'bg-red-50 dark:bg-red-500/10',
            iconText: 'text-red-500 dark:text-red-400',
            accent: 'group-hover:shadow-red-500/5',
        },
        warning: {
            iconBg: 'bg-amber-50 dark:bg-amber-500/10',
            iconText: 'text-amber-500 dark:text-amber-400',
            accent: 'group-hover:shadow-amber-500/5',
        },
        primary: {
            iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
            iconText: 'text-indigo-500 dark:text-indigo-400',
            accent: 'group-hover:shadow-indigo-500/5',
        },
        success: {
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
            iconText: 'text-emerald-500 dark:text-emerald-400',
            accent: 'group-hover:shadow-emerald-500/5',
        },
        info: {
            iconBg: 'bg-blue-50 dark:bg-blue-500/10',
            iconText: 'text-blue-500 dark:text-blue-400',
            accent: 'group-hover:shadow-blue-500/5',
        },
    };

    const config = colorConfig[color];

    return (
        <div className={`group bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${config.accent}`}>
            <div className="flex justify-between items-start">
                <div className="space-y-2 min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight truncate">{value}</h3>
                        {secondaryValue && (
                            <span className="text-xs font-medium text-slate-400 shrink-0">{secondaryValue}</span>
                        )}
                    </div>
                </div>
                <div className={`p-2.5 rounded-xl ${config.iconBg} ${config.iconText} shrink-0 ml-3`}>
                    <IconComponent size={18} strokeWidth={2} />
                </div>
            </div>
            {footer && (
                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                        {footer}
                    </p>
                    {action}
                </div>
            )}
        </div>
    );
};

export default StatCard;
