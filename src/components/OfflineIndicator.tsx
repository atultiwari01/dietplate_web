import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#121c2c] text-white px-3.5 py-2 text-[12px] font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-3.5 h-3.5 text-[#ffb4ab] animate-pulse" />
      <span>Offline mode active — Local cached data is ready</span>
    </div>
  );
};
