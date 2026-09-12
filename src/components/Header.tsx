import React, { useState } from 'react';
import { ViewTab, UserProfile } from '../types';
import { DailyPlateLogo } from './DailyPlateLogo';
import { Bell, Database, CheckCircle2, CloudOff } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  profile: UserProfile;
  onSelectTab: (tab: ViewTab) => void;
  onOpenSheetsModal: () => void;
  isSheetsConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  profile,
  onSelectTab,
  onOpenSheetsModal,
  isSheetsConnected,
}) => {
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const tabTitle = {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    progress: 'Progress',
    profile: 'Profile',
  }[currentTab];

  return (
    <header className="sticky top-0 w-full z-40 bg-[#f9f9ff]/90 backdrop-blur-xl border-b border-[#dee8ff]/80 shadow-[0_1px_8px_rgba(31,36,33,0.03)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left side brand / title */}
        <div className="flex items-center gap-2">
          <DailyPlateLogo size="sm" showText={false} />
          <div className="flex flex-col">
            <span className="font-bold text-[#206140] tracking-tight leading-none text-[16px] sm:text-[18px]">
              DailyPlate
            </span>
            <span className="text-[11px] font-semibold text-[#404942]">
              {tabTitle}
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sheets Quick Status Button */}
          <button
            onClick={onOpenSheetsModal}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all shadow-xs ${
              isSheetsConnected
                ? 'bg-[#c5ffd8]/50 text-[#0a5132] hover:bg-[#c5ffd8]'
                : 'bg-[#ffdbc9]/60 text-[#994703] hover:bg-[#ffdbc9]'
            }`}
            title="Google Sheets Connection Settings"
          >
            <Database className="w-3.5 h-3.5" />
            {isSheetsConnected ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#206140]" /> Sheets Synced
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CloudOff className="w-3 h-3 text-[#994703]" /> Connect Sheets
              </span>
            )}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationToast(true);
                setTimeout(() => setShowNotificationToast(false), 3000);
              }}
              aria-label="Meal Reminders and Notifications"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#404942] hover:bg-[#f0f3ff] transition-colors"
            >
              <Bell className="w-5 h-5" />
              {profile.gentleReminders && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#206140]" />
              )}
            </button>

            {showNotificationToast && (
              <div className="absolute right-0 top-12 w-64 p-3 rounded-xl bg-white shadow-xl border border-[#dee8ff] text-[12px] text-[#121c2c] z-50 animate-in fade-in slide-in-from-top-2">
                <p className="font-semibold text-[#206140]">Gentle Reminder Active</p>
                <p className="text-[#404942] mt-0.5">
                  {profile.gentleReminders
                    ? 'Chimes are set to prompt 10 minutes before your planned meals.'
                    : 'Meal reminders are currently turned off in Profile preferences.'}
                </p>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={() => onSelectTab('profile')}
            aria-label="Go to User Profile"
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs hover:ring-2 hover:ring-[#206140] transition-all"
          >
            <img
              src={profile.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA04s2OHlTUHciFOJr2jMfieUFWiHVUv11-Z8bD3FZngQ4uLYeY6afkVGT5GB6NUP35Z5TRN2N82-wy5FVCLYKD79m-rTHxjVjZtRMyQekvlckE01lMAI8vPJ1z-iNIGmEr3SCIYK9k_vOMxZSNNo7g7Q05NNpvKfywt2X0A7f4Wpdrl6IdfeuaQVrMWvRNqHUg64wXkMvQl0lO1uawriYnhVhRTJQwBkS95hM_Hfpg4FeXh7hjwUjq'}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
