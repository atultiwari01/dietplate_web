import React from 'react';
import { ViewTab } from '../types';
import { LayoutDashboard, Calendar as CalendarIcon, TrendingUp, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard' as ViewTab, label: 'Home', icon: LayoutDashboard },
    { id: 'calendar' as ViewTab, label: 'Calendar', icon: CalendarIcon },
    { id: 'progress' as ViewTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as ViewTab, label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#f9f9ff]/95 backdrop-blur-xl border-t border-[#dee8ff]/80 pb-[calc(env(safe-area-inset-bottom)+6px)] shadow-[0_-2px_12px_rgba(31,36,33,0.05)] select-none"
      aria-label="Mobile Navigation"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center min-w-[60px] min-h-[48px] py-1 text-[#404942] transition-all"
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`flex items-center justify-center w-12 h-8 rounded-full transition-colors ${
                  isActive ? 'bg-[#3b7a57] text-white shadow-xs' : 'text-[#404942] hover:bg-[#e7eeff]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-semibold mt-0.5 tracking-tight ${
                  isActive ? 'text-[#206140]' : 'text-[#404942]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
