import React from 'react';

interface HeaderProps {
    activeTab: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    onNewDebt?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    activeTab,
    searchTerm,
    setSearchTerm,
    isDarkMode,
    toggleDarkMode,
    onNewDebt
}) => {
    const getTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Painel de Controle';
            case 'alerts': return 'Central de Ação Rápida';
            case 'clients': return 'Importação e Clientes';
            default: return 'Financeiro Pro';
        }
    };

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white">
                    {getTitle()}
                </h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Status: Conectado • {new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                    <input
                        className="pl-9 pr-4 py-2 w-64 rounded-xl border-none bg-gray-100 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary dark:text-white"
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
