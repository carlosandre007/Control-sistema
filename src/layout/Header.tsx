import React from 'react';

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
    setSelectedYear
}) => {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

    const getTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Painel de Controle';
            case 'alerts': return 'Central de Ação Rápida';
            case 'clients': return 'Importação e Clientes';
            case 'active_debts': return 'Débitos Vigentes';
            case 'spc_debts': return 'SPC Sumidos';
            case 'transactions': return 'Fluxo de Caixa';
            default: return 'Financeiro Pro';
        }
    };

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">
                        {getTitle()}
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Status: Conectado • {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-transparent border-none text-xs font-black text-slate-900 dark:text-white focus:ring-0 cursor-pointer py-1.5 px-4 min-w-[120px] appearance-none"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{month}</option>
                        ))}
                    </select>
                    <div className="w-px h-5 bg-slate-300 dark:bg-slate-600"></div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-transparent border-none text-xs font-black text-slate-900 dark:text-white focus:ring-0 cursor-pointer py-1.5 px-4 min-w-[80px] appearance-none"
                    >
                        {years.map(year => (
                            <option key={year} value={year} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="relative flex-1 md:flex-none">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                    <input
                        className="pl-9 pr-4 py-2 w-full md:w-64 rounded-xl border-none bg-gray-100 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary dark:text-white"
                        placeholder="Buscar cliente..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    <span className="material-symbols-outlined text-lg">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
                <button
                    onClick={onNewDebt}
                    className="bg-primary hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-sm">add</span> Nova Cobrança
                </button>
            </div>
        </header>
    );
};

export default Header;
