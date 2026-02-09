import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface AlertCardProps {
    title: string;
    description: string;
    count: number;
    amount: string;
    buttonText: string;
    onClick: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ title, description, count, amount, buttonText, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>

                        <div className="flex items-center gap-4 mt-4">
                            <div className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm font-bold">
                                {count} Cobranças
                            </div>
                            <div className="text-lg font-black text-red-600 dark:text-red-400">
                                R$ {amount}
                            </div>
                        </div>
                    </div>
                </div>

                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20">
                    {buttonText}
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default AlertCard;
