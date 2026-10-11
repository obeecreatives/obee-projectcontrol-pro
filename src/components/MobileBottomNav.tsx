import React from 'react';
import { ViewTab, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { Kanban, Calendar, BarChart3, History, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenMoreMenu: () => void;
  isDarkMode?: boolean;
  activeRole?: UserRole;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMoreMenu,
  isDarkMode = true,
  activeRole,
}) => {
  const candidateTabs: Array<{ tab: ViewTab; label: string; icon: React.ReactNode; activeColor: string }> = [
    { tab: 'board', label: 'Board', icon: <Kanban className="w-5 h-5 mb-0.5" />, activeColor: 'text-[#E30000]' },
    { tab: 'calendar', label: 'Kalender', icon: <Calendar className="w-5 h-5 mb-0.5" />, activeColor: 'text-emerald-500' },
    { tab: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5 mb-0.5" />, activeColor: 'text-blue-500' },
    { tab: 'activity', label: 'Aktivitas', icon: <History className="w-5 h-5 mb-0.5" />, activeColor: 'text-amber-500' },
  ];

  const allowedTabs = candidateTabs.filter((item) =>
    !activeRole || storageService.isTabAllowedForRole(activeRole, item.tab)
  );

  return (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${isDarkMode ? 'bg-[#0f172a]/95 border-slate-800 text-slate-400' : 'bg-white/95 border-slate-200 text-slate-600'} backdrop-blur-md border-t h-16 px-2 shadow-lg transition-colors`}>
      <div className="flex h-full items-center justify-around">
        {allowedTabs.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
                isActive ? `${item.activeColor} font-bold` : isDarkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenMoreMenu}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            ['ratecard', 'staff_database', 'headless_gas', 'access_settings', 'docs'].includes(currentTab)
              ? 'text-purple-500 font-bold'
              : isDarkMode
              ? 'hover:text-slate-200'
              : 'hover:text-slate-900'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Menu Lain</span>
        </button>
      </div>
    </nav>
  );
};

