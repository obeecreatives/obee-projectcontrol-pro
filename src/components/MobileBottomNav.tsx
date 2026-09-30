import React from 'react';
import { ViewTab } from '../types';
import { Kanban, Calendar, BarChart3, History, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenMoreMenu: () => void;
  isDarkMode?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMoreMenu,
  isDarkMode = true,
}) => {
  return (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${isDarkMode ? 'bg-[#0f172a]/95 border-slate-800 text-slate-400' : 'bg-white/95 border-slate-200 text-slate-600'} backdrop-blur-md border-t h-16 px-2 shadow-lg transition-colors`}>
      <div className="grid grid-cols-5 h-full items-center">
        <button
          onClick={() => onSelectTab('board')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'board' ? 'text-[#E30000] font-bold' : isDarkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'
          }`}
        >
          <Kanban className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Board</span>
        </button>

        <button
          onClick={() => onSelectTab('calendar')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'calendar' ? 'text-emerald-500 font-bold' : isDarkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Kalender</span>
        </button>

        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'dashboard' ? 'text-blue-500 font-bold' : isDarkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('activity')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'activity' ? 'text-amber-500 font-bold' : isDarkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Aktivitas</span>
        </button>

        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            ['ratecard', 'staff_database', 'headless_gas', 'access_settings'].includes(currentTab) ? 'text-purple-500 font-bold' : isDarkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Menu Lain</span>
        </button>
      </div>
    </nav>
  );
};
