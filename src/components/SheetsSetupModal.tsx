import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw, X, FileCode } from 'lucide-react';
import { api } from '../services/api';

interface SheetsSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (url: string) => Promise<void>;
  onSyncNow: () => Promise<void>;
  isSheetsConnected: boolean;
}

export const SheetsSetupModal: React.FC<SheetsSetupModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl,
  onSyncNow,
  isSheetsConnected,
}) => {
  const [gasUrl, setGasUrl] = useState(currentUrl);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'connect' | 'guide'>('connect');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a Google Apps Script Web App URL.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testConnection(gasUrl.trim());
      setTestResult(res);
      if (res.success) {
        await onSaveUrl(gasUrl.trim());
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await onSyncNow();
      setTestResult({ success: true, message: 'Data successfully synchronized with Google Sheets.' });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySnippet = () => {
    const codeSnippet = `// DailyPlate Apps Script snippet: see /gas/Code.gs for full script
function doGet(e) { return ContentService.createTextOutput(JSON.stringify({status: "success", message: "DailyPlate connected!"})).setMimeType(ContentService.MimeType.JSON); }`;
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#dee8ff]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#aff1c6] text-[#206140] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[18px] text-[#121c2c]">Google Sheets Connection</h3>
              <p className="text-[12px] text-[#404942]">Google Sheets is your source of truth database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f3ff] text-[#404942] hover:bg-[#dee8ff] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 flex border-b border-[#dee8ff]/50 gap-2">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-colors border-b-2 ${
              activeTab === 'connect'
                ? 'border-[#206140] text-[#206140]'
                : 'border-transparent text-[#404942] hover:text-[#121c2c]'
            }`}
          >
            Connect & Sync
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-colors border-b-2 ${
              activeTab === 'guide'
                ? 'border-[#206140] text-[#206140]'
                : 'border-transparent text-[#404942] hover:text-[#121c2c]'
            }`}
          >
            Quick 2-Min Setup Guide
          </button>
        </div>

        {/* Tab 1: Connect & Sync */}
        {activeTab === 'connect' && (
          <div className="p-5 flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#d9e3f9]/70 flex items-start gap-3">
              {isSheetsConnected ? (
                <CheckCircle2 className="w-5 h-5 text-[#206140] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#994703] shrink-0 mt-0.5" />
              )}
              <div className="text-[12px] leading-relaxed text-[#121c2c]">
                <p className="font-bold text-[13px]">
                  {isSheetsConnected ? 'Google Sheets Sync Active' : 'Currently in Local Database Mode'}
                </p>
                <p className="text-[#404942] mt-0.5">
                  {isSheetsConnected
                    ? 'All your meals, weights, and daily adherence stats are stored in your private Google Sheets spreadsheet.'
                    : 'To make Google Sheets your source of truth, deploy the Apps Script from /gas/Code.gs and paste the Web App URL below.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#121c2c]">Google Apps Script Web App URL</label>
              <input
                type="url"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f0f3ff] text-[13px] text-[#121c2c] border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#206140]"
              />
              <span className="text-[11px] text-[#404942]">Must end in &quot;/exec&quot; from your Web App deployment.</span>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-[12px] flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-[#c5ffd8]/50 text-[#002111] font-semibold'
                    : 'bg-[#ffdad6] text-[#ba1a1a] font-medium'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="flex-1 h-11 rounded-xl bg-[#206140] text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#3b7a57] disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{testing ? 'Testing...' : 'Test & Save Connection'}</span>
              </button>

              {isSheetsConnected && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="h-11 px-4 rounded-xl bg-[#f0f3ff] text-[#121c2c] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#dee8ff] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Setup Guide */}
        {activeTab === 'guide' && (
          <div className="p-5 flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto text-[13px]">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0f3ff]">
              <span className="font-semibold text-[#121c2c]">Step 1: Open Google Sheets</span>
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[12px] font-bold text-[#206140] hover:underline"
              >
                <span>Create New Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-3 rounded-xl bg-[#f0f3ff] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#121c2c]">Step 2: Copy Apps Script</span>
                <button
                  onClick={handleCopySnippet}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#206140] hover:underline"
                >
                  {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-[#206140]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#404942]">
                In your Google Sheet, click <b>Extensions &gt; Apps Script</b>, replace Code.gs with the full content in the project&apos;s <code>gas/Code.gs</code> file.
              </p>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#206140]" />
                <span className="text-[11px] text-[#206140] font-mono">/gas/Code.gs includes all 5 sheets schemas!</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f0f3ff] flex flex-col gap-1">
              <span className="font-semibold text-[#121c2c]">Step 3: Deploy as Web App</span>
              <p className="text-[11px] text-[#404942] leading-relaxed">
                Click <b>Deploy &gt; New deployment &gt; Web app</b>. Select Execute as: <b>Me</b>, and Who has access: <b>Anyone</b>. Copy the resulting URL and paste it into the Connect tab.
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-[#f9f9ff] border-t border-[#dee8ff]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#404942] hover:bg-[#dee8ff]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
