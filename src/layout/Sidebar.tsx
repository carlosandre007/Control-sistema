import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import SidebarItem from '../components/SidebarItem';

interface SidebarProps {
    activeTab: 'dashboard' | 'alerts' | 'clients' | 'transactions' | 'active_debts' | 'spc_debts' | 'backup' | 'central_financeira';
    setActiveTab: (tab: 'dashboard' | 'alerts' | 'clients' | 'transactions' | 'active_debts' | 'spc_debts' | 'backup' | 'central_financeira') => void;
    overdueCount: number;
    onLogout?: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, overdueCount, onLogout, isMobileOpen, onMobileClose }) => {
    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? saved === 'true' : true;
    });

    useEffect(() => {
        localStorage.setItem('sidebarOpen', isOpen.toString());
    }, [isOpen]);

    const handleNavClick = (tab: typeof activeTab) => {
        setActiveTab(tab);
        onMobileClose?.();
    };

    const sidebarContent = (isMobile = false) => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className={`h-16 flex items-center shrink-0 border-b border-slate-100 dark:border-slate-800/60 ${
                (isMobile || isOpen) ? 'px-5 gap-3' : 'px-0 justify-center'
            }`}>
                <div className="min-w-9 w-9 h-9 bg-gradient-to-br from-primary to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                    <span className="material-symbols-outlined text-lg font-bold">account_balance_wallet</span>
                </div>
                {(isMobile || isOpen) && (
                    <div className="flex flex-col whitespace-nowrap overflow-hidden">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">Cobrança</span>
                        <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-widest">Financeiro Pro</span>
                    </div>
                )}
                {isMobile && (
                    <button
                        onClick={onMobileClose}
                        className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 scrollbar-hide transition-all duration-300 ${
                (isMobile || isOpen) ? 'px-3' : 'px-2'
            }`}>
                <div className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 ${(isMobile || isOpen) ? 'px-3' : 'text-center'}`}>
                    {(isMobile || isOpen) ? 'Menu Principal' : '•'}
                </div>

                <SidebarItem icon="grid_view" label="Painel Geral" active={activeTab === 'dashboard'} onClick={() => handleNavClick('dashboard')} isOpen={isMobile || isOpen} />
                <SidebarItem icon="receipt_long" label="Transações" active={activeTab === 'transactions'} onClick={() => handleNavClick('transactions')} isOpen={isMobile || isOpen} />
                <SidebarItem icon="notifications_active" label="Ação Rápida" active={activeTab === 'alerts'} badge={overdueCount} onClick={() => handleNavClick('alerts')} isOpen={isMobile || isOpen} />
                <SidebarItem icon="group" label="Base de Clientes" active={activeTab === 'clients'} onClick={() => handleNavClick('clients')} isOpen={isMobile || isOpen} />

                <div className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-5 mb-2 ${(isMobile || isOpen) ? 'px-3' : 'text-center'}`}>
                    {(isMobile || isOpen) ? 'Controle Pessoal' : '•'}
                </div>
                
                <SidebarItem icon="account_balance" label="Central Financeira" active={activeTab === 'central_financeira'} onClick={() => handleNavClick('central_financeira')} isOpen={isMobile || isOpen} />

                <div className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-5 mb-2 ${(isMobile || isOpen) ? 'px-3' : 'text-center'}`}>
                    {(isMobile || isOpen) ? 'Cobranças' : '•'}
                </div>

                <SidebarItem icon="list_alt" label="Débitos Vigentes" active={activeTab === 'active_debts' as any} onClick={() => handleNavClick('active_debts' as any)} isOpen={isMobile || isOpen} />
                <SidebarItem icon="person_off" label="SPC Sumidos" active={activeTab === 'spc_debts' as any} onClick={() => handleNavClick('spc_debts' as any)} isOpen={isMobile || isOpen} />

                <div className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-5 mb-2 ${(isMobile || isOpen) ? 'px-3' : 'text-center'}`}>
                    {(isMobile || isOpen) ? 'Sistema' : '•'}
                </div>

                <SidebarItem icon="backup" label="Backup / Restore" active={activeTab === 'backup' as any} onClick={() => handleNavClick('backup' as any)} isOpen={isMobile || isOpen} />
            </nav>

            {/* Footer */}
            <div className={`shrink-0 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 transition-all duration-300 ${
                (isMobile || isOpen) ? 'p-3' : 'p-2'
            }`}>
                <button
                    onClick={onLogout}
                    title={!(isMobile || isOpen) ? "Sair do Sistema" : undefined}
                    className={`w-full rounded-xl border border-slate-100 dark:border-slate-800 flex items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                        (isMobile || isOpen) ? 'p-2.5 gap-3' : 'p-2 justify-center'
                    }`}
                >
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
                        <span className="material-symbols-outlined text-base">logout</span>
                    </div>
                    {(isMobile || isOpen) && (
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-xs font-semibold text-slate-700 dark:text-white truncate">Sair</p>
                            <p className="text-[10px] text-slate-400 truncate">Encerrar sessão</p>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`bg-white dark:bg-surface-dark border-r border-slate-200/70 dark:border-slate-800/60 hidden md:flex flex-col transition-all duration-300 relative ${
                isOpen ? 'w-[260px]' : 'w-[68px]'
            }`}>
                {/* Collapse button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -right-3 top-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary shadow-sm transition-all z-10 hover:scale-110"
                    title={isOpen ? "Recolher" : "Expandir"}
                >
                    {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                {sidebarContent()}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <>
                    <div className="sidebar-mobile-overlay md:hidden" onClick={onMobileClose} />
                    <aside className="sidebar-mobile md:hidden bg-white dark:bg-surface-dark shadow-2xl">
                        {sidebarContent(true)}
                    </aside>
                </>
            )}
        </>
    );
};

export default Sidebar;
