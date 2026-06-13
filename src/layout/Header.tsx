import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
    activeTab: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    onNewDebt?: () => void;
    selectedMonth: number;
    setSelectedMonth: (month: number) => void;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    activeTab,
    searchTerm,
    setSearchTerm,
    isDarkMode,
    toggleDarkMode,
    onNewDebt,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    onMobileMenuToggle
}) => {
    const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

    const getTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Painel de Controle';
            case 'alerts': return 'Ação Rápida';
            case 'clients': return 'Clientes';
            case 'active_debts': return 'Débitos Vigentes';
            case 'spc_debts': return 'SPC Sumidos';
            case 'transactions': return 'Fluxo de Caixa';
            case 'backup': return 'Backup';
            case 'central_financeira': return 'Central Financeira';
            default: return 'CrediFlow';
        }
    };

    const getIcon = () => {
        switch (activeTab) {
            case 'dashboard': return 'grid_view';
            case 'alerts': return 'notifications_active';
            case 'clients': return 'group';
            case 'active_debts': return 'list_alt';
            case 'spc_debts': return 'person_off';
            case 'transactions': return 'receipt_long';
            case 'backup': return 'backup';
            case 'central_financeira': return 'account_balance';
            default: return 'grid_view';
        }
    };

    return (
        <header className="glass sticky top-0 z-20 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
                {/* Left: Mobile menu + Title */}
                <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile hamburger */}
                    <button
                        onClick={onMobileMenuToggle}
                        className="md:hidden p-2 -ml-1 text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg hidden sm:block">{getIcon()}</span>
                            <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                                {getTitle()}
                            </h1>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium hidden md:block mt-0.5">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Center: Month/Year selector */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors appearance-none min-w-[60px]"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index} className="bg-white dark:bg-slate-800">{month}</option>
                        ))}
                    </select>
                    <div className="w-px h-4 bg-slate-300/60 dark:bg-slate-600/60"></div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors appearance-none min-w-[60px]"
                    >
                        {years.map(year => (
                            <option key={year} value={year} className="bg-white dark:bg-slate-800">{year}</option>
                        ))}
                    </select>
                </div>

                {/* Right: Search + Actions */}
                <div className="flex items-center gap-2">
                    <div className="relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            className="pl-9 pr-4 py-2 w-56 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/80 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white outline-none transition-all placeholder:text-slate-400"
                            placeholder="Buscar..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={toggleDarkMode}
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                    </button>

                    <button
                        onClick={onNewDebt}
                        className="bg-primary hover:bg-primary-hover text-white px-3 md:px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span className="hidden sm:inline">Nova Cobrança</span>
                    </button>
                </div>
            </div>

            {/* Mobile: Month/Year + Search row */}
            <div className="sm:hidden px-4 pb-3 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex-1">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer py-1.5 px-2 flex-1 appearance-none"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer py-1.5 px-2 appearance-none"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/80 text-xs focus:ring-2 focus:ring-primary/20 dark:text-white outline-none transition-all placeholder:text-slate-400"
                        placeholder="Buscar..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
