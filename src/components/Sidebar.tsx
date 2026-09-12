import React from 'react';
import { ViewTab, UserProfile } from '../types';
import { DailyPlateLogo } from './DailyPlateLogo';
import { LayoutDashboard, Calendar as CalendarIcon, TrendingUp, User, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  profile: UserProfile;
  onOpenSheetsModal: () => void;
  isSheetsConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  onOpenSheetsModal,
  isSheetsConnected,
}) => {
  const navItems = [
    { id: 'dashboard' as ViewTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as ViewTab, label: 'Calendar', icon: CalendarIcon },
    { id: 'progress' as ViewTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as ViewTab, label: 'Profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#dee8ff]/80 min-h-screen p-5 justify-between select-none shrink-0 sticky top-0 h-screen z-20">
      <div className="flex flex-col gap-6">
        {/* Logo and Brand */}
        <div className="pt-2">
          <DailyPlateLogo size="md" subtitle="Diet Planning & Tracking" />
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5 pt-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-[14px] transition-all text-left ${
                  isActive
                    ? 'bg-[#206140] text-white shadow-sm'
                    : 'text-[#404942] hover:bg-[#f0f3ff] hover:text-[#121c2c]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#404942]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Google Sheets Sync Card */}
        <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#d9e3f9]/60 flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#121c2c]">
              <Database className="w-3.5 h-3.5 text-[#206140]" />
              <span>Google Sheets</span>
            </div>
            {isSheetsConnected ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#206140] bg-[#aff1c6]/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#994703] bg-[#ffdbc9]/60 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> Local Ready
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#404942] leading-relaxed">
            {isSheetsConnected
              ? 'Real-time database sync active with your spreadsheet.'
              : 'Connect your Google Sheet via Google Apps Script for live cloud persistence.'}
          </p>
          <button
            onClick={onOpenSheetsModal}
            className="w-full text-center py-1.5 px-2.5 rounded-lg bg-white border border-[#bfc9c0]/50 text-[11px] font-semibold text-[#206140] hover:bg-[#e7eeff] transition-colors"
          >
            {isSheetsConnected ? 'Manage Connection' : 'Setup Google Sheets'}
          </button>
        </div>
      </div>

      {/* User profile footer */}
      <div className="pt-4 border-t border-[#dee8ff]/80 flex items-center justify-between">
        <button
          onClick={() => onSelectTab('profile')}
          className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-[#f0f3ff] transition-colors text-left"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#bfc9c0]">
            <img
              src={profile.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA04s2OHlTUHciFOJr2jMfieUFWiHVUv11-Z8bD3FZngQ4uLYeY6afkVGT5GB6NUP35Z5TRN2N82-wy5FVCLYKD79m-rTHxjVjZtRMyQekvlckE01lMAI8vPJ1z-iNIGmEr3SCIYK9k_vOMxZSNNo7g7Q05NNpvKfywt2X0A7f4Wpdrl6IdfeuaQVrMWvRNqHUg64wXkMvQl0lO1uawriYnhVhRTJQwBkS95hM_Hfpg4FeXh7hjwUjq'}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[13px] text-[#121c2c] truncate">{profile.name}</span>
            <span className="text-[11px] text-[#404942] truncate">
              {profile.currentWeight} {profile.weightUnit} • {profile.memberSince}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
