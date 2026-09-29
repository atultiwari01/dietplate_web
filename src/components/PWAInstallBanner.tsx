import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, HelpCircle, CheckCircle2 } from 'lucide-react';

interface PWAInstallBannerProps {
  onOpenAndroidGuide: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenAndroidGuide }) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  // If already installed or dismissed by user for this session, hide
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#eef8f2] via-[#ffffff] to-[#e7f4ec] border-b border-[#dee8ff] py-2 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#206140] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-[#121c2c] truncate flex items-center gap-1.5">
              <span>Use DailyPlate on Android</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-[#aff1c6] text-[#002111] text-[9px] font-extrabold uppercase">
                Zero Permissions
              </span>
            </p>
            <p className="text-[11px] text-[#404942] truncate hidden xs:block">
              Add to Home Screen for a native standalone app experience.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable && (
            <button
              onClick={() => install()}
              className="h-8 px-3 rounded-lg bg-[#206140] text-white font-bold text-[11px] flex items-center gap-1.5 hover:bg-[#3b7a57] transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          <button
            onClick={onOpenAndroidGuide}
            className="h-8 px-2.5 rounded-lg bg-white border border-[#dee8ff] text-[#206140] font-bold text-[11px] flex items-center gap-1 hover:bg-[#f0f3ff] transition"
            title="Android Setup Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Setup Guide</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            className="w-7 h-7 rounded-lg text-[#707972] hover:text-[#121c2c] hover:bg-black/5 flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
