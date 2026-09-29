import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  Sparkles,
  X,
  Lock,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidSetupModal: React.FC<AndroidSetupModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'network' | 'privacy'>('install');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#dee8ff] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#f2fbf5] via-[#ffffff] to-[#e8f6ee] border-b border-[#dee8ff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#206140] text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-[#121c2c]">Android Phone Setup</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#aff1c6] text-[#002111] text-[10px] font-extrabold uppercase">
                  PWA Ready
                </span>
              </div>
              <p className="text-[12px] text-[#404942]">Install & use DailyPlate directly on your Android phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-white/80 border border-[#dee8ff] text-[#404942] hover:text-[#121c2c] flex items-center justify-center transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#dee8ff] bg-[#f9f9ff] px-6 pt-2">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'install'
                ? 'border-[#206140] text-[#206140]'
                : 'border-transparent text-[#707972] hover:text-[#121c2c]'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> 1-Tap Install
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'network'
                ? 'border-[#206140] text-[#206140]'
                : 'border-transparent text-[#707972] hover:text-[#121c2c]'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" /> Local Wi-Fi / URL
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-[#206140] text-[#206140]'
                : 'border-transparent text-[#707972] hover:text-[#121c2c]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy & Zero-Permissions
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-[13px] text-[#121c2c] space-y-4">
          {/* TAB 1: 1-Tap Install */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* Direct Install Button if browser supports prompt */}
              {isInstallable ? (
                <div className="p-4 rounded-2xl bg-[#c5ffd8]/40 border border-[#aff1c6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#002111] text-[14px]">Ready for 1-Tap Android Install</h3>
                    <p className="text-[12px] text-[#206140] mt-0.5">
                      Install DailyPlate to your Android home screen as an independent app.
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="h-10 px-5 rounded-xl bg-[#206140] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-md hover:bg-[#3b7a57] transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" /> Install App Now
                  </button>
                </div>
              ) : isInstalled ? (
                <div className="p-4 rounded-2xl bg-[#c5ffd8]/40 border border-[#aff1c6] flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#206140] shrink-0" />
                  <div>
                    <h3 className="font-bold text-[#002111] text-[13px]">DailyPlate is already installed!</h3>
                    <p className="text-[11px] text-[#206140]">You are enjoying the standalone full-screen experience.</p>
                  </div>
                </div>
              ) : null}

              {/* Step by Step Chrome instructions */}
              <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] space-y-3">
                <h3 className="font-bold text-[14px] text-[#121c2c] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#206140] text-white text-[11px] flex items-center justify-center font-bold">
                    1
                  </span>
                  Open on your Android Phone
                </h3>
                <p className="text-[12px] text-[#404942]">
                  Open Google Chrome (or Samsung Internet, Brave, or Edge) on your phone and navigate to:
                </p>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#dee8ff]">
                  <code className="text-[12px] font-mono text-[#206140] truncate flex-1">{currentUrl}</code>
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 rounded-lg bg-[#f0f3ff] text-[#206140] font-bold text-[11px] hover:bg-[#dee8ff] transition flex items-center gap-1 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#206140]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] space-y-3">
                <h3 className="font-bold text-[14px] text-[#121c2c] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#206140] text-white text-[11px] flex items-center justify-center font-bold">
                    2
                  </span>
                  Add to Android Home Screen
                </h3>
                <ul className="space-y-2 text-[12px] text-[#404942]">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#121c2c]">•</span>
                    <span>
                      In Chrome, tap the <strong>three dots menu (⋮)</strong> in the top-right corner.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#121c2c]">•</span>
                    <span>
                      Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#121c2c]">•</span>
                    <span>
                      Tap <strong>Install</strong>. DailyPlate will install to your launcher drawer and home screen.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] space-y-2">
                <h3 className="font-bold text-[14px] text-[#121c2c] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#206140] text-white text-[11px] flex items-center justify-center font-bold">
                    3
                  </span>
                  Native App Experience
                </h3>
                <p className="text-[12px] text-[#404942]">
                  When opened from your home screen, DailyPlate runs with:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-[#121c2c]">
                  <div className="p-2 bg-white rounded-lg border border-[#dee8ff] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#206140]" /> Full screen (no URL bar)
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#dee8ff] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#206140]" /> Offline service caching
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#dee8ff] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#206140]" /> Smooth mobile bottom bar
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#dee8ff] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#206140]" /> Fast quick-add meals
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Network / Localhost to Android */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] space-y-2">
                <h3 className="font-bold text-[14px] text-[#121c2c] flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#206140]" />
                  Connecting from Phone to Computer (Local Wi-Fi)
                </h3>
                <p className="text-[12px] text-[#404942]">
                  If you are hosting the app locally on your computer with <code>npm run dev</code>:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-[12px] text-[#404942] pl-1">
                  <li>
                    Ensure your <strong>computer</strong> and <strong>Android phone</strong> are connected to the <strong>same Wi-Fi router</strong>.
                  </li>
                  <li>
                    Find your computer&apos;s local IP address:
                    <div className="bg-[#121c2c] text-white p-2 rounded-lg font-mono text-[11px] my-1">
                      # Windows (Command Prompt):<br />ipconfig<br /><br />
                      # Mac / Linux (Terminal):<br />hostname -I &nbsp;or&nbsp; ifconfig | grep &quot;inet &quot;
                    </div>
                  </li>
                  <li>
                    Look for your IPv4 address (e.g. <code>192.168.1.50</code>).
                  </li>
                  <li>
                    On your Android phone, open Chrome and type:
                    <div className="p-2 bg-white border border-[#206140] rounded-lg font-mono text-[12px] text-[#206140] font-bold mt-1">
                      http://192.168.1.50:3000
                    </div>
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] space-y-2">
                <h4 className="font-bold text-[13px] text-[#121c2c]">Tip: Remote Access over the Internet</h4>
                <p className="text-[12px] text-[#404942]">
                  For accessing the app outside your home network, you can run a free, secure tunnel or deploy the app:
                </p>
                <div className="bg-[#f0f3ff] p-2.5 rounded-xl font-mono text-[11px] text-[#121c2c]">
                  npx cloudflared tunnel --url http://localhost:3000
                </div>
                <p className="text-[11px] text-[#707972]">
                  This instantly generates an HTTPS link you can open on any mobile phone in the world with zero router configuration.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Privacy & Zero-Permissions */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#c5ffd8]/30 border border-[#aff1c6] space-y-2">
                <div className="flex items-center gap-2 text-[#002111] font-bold text-[14px]">
                  <Lock className="w-4 h-4 text-[#206140]" />
                  100% Personal & Zero Control Permissions
                </div>
                <p className="text-[12px] text-[#002111]/80 leading-relaxed">
                  As requested, DailyPlate is built specifically for <strong>personal, single-user wellness tracking</strong> without telemetry, tracking scripts, ad SDKs, or invasive phone access.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-[13px] text-[#121c2c]">Android Permissions Status:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                  <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between">
                    <span>Camera Access</span>
                    <span className="font-bold text-[#206140] text-[11px] bg-[#aff1c6] px-2 py-0.5 rounded-full">
                      NEVER ASKED
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between">
                    <span>Microphone Access</span>
                    <span className="font-bold text-[#206140] text-[11px] bg-[#aff1c6] px-2 py-0.5 rounded-full">
                      NEVER ASKED
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between">
                    <span>GPS / Location</span>
                    <span className="font-bold text-[#206140] text-[11px] bg-[#aff1c6] px-2 py-0.5 rounded-full">
                      NEVER ASKED
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between">
                    <span>Contacts & Phone Calls</span>
                    <span className="font-bold text-[#206140] text-[11px] bg-[#aff1c6] px-2 py-0.5 rounded-full">
                      NEVER ASKED
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between">
                    <span>Device File System Control</span>
                    <span className="font-bold text-[#206140] text-[11px] bg-[#aff1c6] px-2 py-0.5 rounded-full">
                      NEVER ASKED
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between">
                    <span>Targeted Advertising IDs</span>
                    <span className="font-bold text-[#206140] text-[11px] bg-[#aff1c6] px-2 py-0.5 rounded-full">
                      ZERO ADS
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] space-y-1.5">
                <h4 className="font-bold text-[13px] text-[#121c2c]">Where is your data stored?</h4>
                <p className="text-[12px] text-[#404942] leading-relaxed">
                  Your meal plans, weight logs, and metrics are stored directly on your phone storage via standard Web Storage API. If you choose to connect Google Sheets, data synchronizes exclusively to <strong>your personal Google Spreadsheet</strong> via your private Apps Script Web App. No third party ever sees your food or body metrics.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#f9f9ff] border-t border-[#dee8ff] flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#707972] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#206140]" />
            <span>Designed for portrait Android screens &amp; tablets</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#206140] text-white font-bold text-[12px] hover:bg-[#3b7a57] transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
