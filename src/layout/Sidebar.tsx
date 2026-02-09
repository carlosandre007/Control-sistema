import React from 'react';
import SidebarItem from '../components/SidebarItem';

interface SidebarProps {
    activeTab: 'dashboard' | 'alerts' | 'clients' | 'transactions' | 'active_debts' | 'backup';
    setActiveTab: (tab: 'dashboard' | 'alerts' | 'clients' | 'transactions' | 'active_debts' | 'backup') => void;
    overdueCount: number;
    onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, overdueCount, onLogout }) => {
    return (
        <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-slate-800 hidden md:flex flex-col shadow-xl">
            <div className="h-20 flex items-center px-6 gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined font-bold">account_balance_wallet</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black text-gray-900 dark:text-white leading-tight">Cobrança</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Financeiro Pro</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <SidebarItem
                    icon="grid_view"
                    label="Painel Geral"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                />
                <SidebarItem
                    icon="receipt_long"
                    label="Transações"
                    active={activeTab === 'transactions'}
                    onClick={() => setActiveTab('transactions')}
                />
                <SidebarItem
                    icon="notifications_active"
                    label="Ação Rápida"
                    active={activeTab === 'alerts'}
                    badge={overdueCount}
                    onClick={() => setActiveTab('alerts')}
                />
                <SidebarItem
                    icon="group"
                    label="Base de Clientes"
                    active={activeTab === 'clients'}
                    onClick={() => setActiveTab('clients')}
                />
                <SidebarItem
                    icon="list_alt"
                    label="Débitos Vigentes"
                    active={activeTab === 'active_debts' as any}
                    onClick={() => setActiveTab('active_debts' as any)}
                />
                <SidebarItem
                    icon="backup"
                    label="Backup / Restore"
                    active={activeTab === 'backup' as any}
                    onClick={() => setActiveTab('backup' as any)}
                />
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/20">
                <button
                    onClick={onLogout}
                    className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-lg">logout</span>
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Usuário Ativo</p>
                        <p className="text-[10px] text-gray-500 truncate">Sair do Sistema</p>
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
