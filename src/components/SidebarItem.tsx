import React from 'react';

interface SidebarItemProps {
    icon: string;
    label: string;
    active?: boolean;
    badge?: number;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, badge, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center px-4 py-3 rounded-lg group transition-colors ${active
                ? 'bg-primary/10 text-primary dark:text-indigo-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
    >
        <span className="material-symbols-outlined text-xl mr-3">{icon}</span>
        <span className="text-sm">{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className="ml-auto bg-danger text-white py-0.5 px-2 rounded-full text-[10px] font-bold">
                {badge}
            </span>
        )}
    </button>
);

export default SidebarItem;
