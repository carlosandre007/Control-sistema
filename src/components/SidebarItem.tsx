import React from 'react';

interface SidebarItemProps {
    icon: string;
    label: string;
    active?: boolean;
    badge?: number;
    onClick: () => void;
    isOpen?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, badge, onClick, isOpen = true }) => (
    <button
        onClick={onClick}
        title={!isOpen ? label : undefined}
        className={`w-full flex items-center rounded-xl group transition-all duration-200 relative ${
            isOpen ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center'
        } ${active
                ? 'bg-primary/10 text-primary dark:text-indigo-400 font-semibold shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
    >
        {/* Active indicator bar */}
        {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
        )}

        <span className={`material-symbols-outlined text-xl transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>
            {icon}
        </span>

        {isOpen && (
            <span className="text-[13px] whitespace-nowrap overflow-hidden transition-all duration-300 tracking-tight">
                {label}
            </span>
        )}

        {badge !== undefined && badge > 0 && (
            <span className={isOpen 
                ? "ml-auto bg-danger text-white py-0.5 px-2 rounded-full text-[10px] font-bold shrink-0 animate-pulse-soft" 
                : "absolute -top-0.5 -right-0.5 bg-danger text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm animate-pulse-soft"}>
                {isOpen ? badge : (badge > 99 ? '99+' : badge)}
            </span>
        )}
    </button>
);

export default SidebarItem;
