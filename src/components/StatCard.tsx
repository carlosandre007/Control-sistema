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

    const colorClasses = {
        danger: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        primary: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        info: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                        {secondaryValue && (
                            <span className="text-xs font-medium text-slate-400">{secondaryValue}</span>
                        )}
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <IconComponent size={20} strokeWidth={2.5} />
                </div>
            </div>
            {footer && (
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between gap-4">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {footer}
                    </p>
                    {action}
                </div>
            )}
        </div>
    );
};

export default StatCard;
