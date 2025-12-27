import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    footer: string;
    color: 'danger' | 'warning' | 'primary' | 'success';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, footer, color }) => {
    const colorClasses = {
        danger: 'border-danger text-danger bg-red-50 dark:bg-red-900/20',
        warning: 'border-warning text-warning bg-orange-50 dark:bg-orange-900/20',
        primary: 'border-primary text-primary bg-indigo-50 dark:bg-indigo-900/20',
        success: 'border-success text-success bg-green-50 dark:bg-green-900/20',
    };

    return (
        <div className={`bg-surface-light dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
                <span className={`text-xs font-medium ${color === 'success' ? 'text-green-600' : color === 'danger' ? 'text-red-600' : 'text-gray-500'}`}>
                    {footer}
                </span>
            </div>
        </div>
    );
};

export default StatCard;
