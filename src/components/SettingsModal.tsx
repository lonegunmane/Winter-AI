import React, { useState } from 'react';
import {
  X,
  Key,
  Cpu,
  Sliders,
  FileText,
  Trash2,
  Download,
  Sun,
  Moon,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  HardDrive,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppSettings, AVAILABLE_MODELS, DEFAULT_SYSTEM_PROMPT, ServerStatus } from '../types';
import { getStorageUsage, clearMessages, exportChatHistory } from '../utils/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  serverStatus: ServerStatus | null;
  messageCount: number;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  serverStatus,
  messageCount,
  onClearHistory,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'model' | 'personality' | 'appearance' | 'data'>('model');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const storageUsage = getStorageUsage();

  const handleTestApiKey = async () => {
    setTestStatus('testing');
    setTestMessage('Testing API connection...');

    const keyToTest = formData.apiKey?.trim();

    try {
      let testPassed = false;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Say "Winter is ready" in 3 words.' }],
            model: formData.model || 'gemini-3.8-flash',
            customApiKey: keyToTest || undefined,
          }),
        });

        if (response.ok) {
          testPassed = true;
        }
      } catch {
        // Continue to direct test
      }

      if (!testPassed && keyToTest) {
        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          formData.model || 'gemini-3.8-flash'
        )}:generateContent?key=${encodeURIComponent(keyToTest)}`;

        const directRes = await fetch(directUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
          }),
        });

        if (!directRes.ok) {
          const errData = await directRes.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${directRes.status}: Invalid API key`);
        }
        testPassed = true;
      }

      if (!testPassed && !keyToTest) {
        throw new Error('Please enter an API key to test.');
      }

      setTestStatus('success');
      setTestMessage('Key validated! Gemini is connected.');
      setTimeout(() => setTestStatus('idle'), 4000);
    } catch (err: unknown) {
      setTestStatus('error');
      setTestMessage(err instanceof Error ? err.message : 'Failed to connect to Gemini API');
    }
  };

  const handleSaveAndClose = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleResetSystemPrompt = () => {
    setFormData((prev) => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-xl max-h-[92vh] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">❄️</span>
            <div>
              <h2 className="text-base font-semibold text-white">Winter Settings</h2>
              <p className="text-xs text-slate-400">Personal AI Assistant Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation for clean low-spec mobile browsing */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 gap-1 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('model')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'model'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>AI &amp; API Key</span>
          </button>
          <button
            onClick={() => setActiveTab('personality')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'personality'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personality</span>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'appearance'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Theme &amp; UI</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'data'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Storage ({messageCount})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* TAB 1: MODEL & API KEY */}
          {activeTab === 'model' && (
            <div className="space-y-5">
              {/* API Key Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-sky-400" />
                    <span>Gemini API Key</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                  >
                    <span>Get free key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder={
                      serverStatus?.hasServerKey
                        ? 'Using environment key (or paste custom key here)'
                        : 'AIzaSy...'
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 pr-20 font-mono"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 text-slate-400 hover:text-white"
                      title={showKey ? 'Hide key' : 'Show key'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Key Status Hint */}
                <div className="flex items-center justify-between text-xs pt-1">
                  {serverStatus?.hasServerKey ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs">
                      <Check className="w-3.5 h-3.5" />
                      Server API key active
                    </span>
                  ) : formData.apiKey.trim() ? (
                    <span className="text-slate-400 text-xs">Custom key stored securely in browser</span>
                  ) : (
                    <span className="text-amber-400/90 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Key required to chat
                    </span>
                  )}

                  <button
                    onClick={handleTestApiKey}
                    disabled={testStatus === 'testing'}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-sky-300 disabled:opacity-50 transition-colors"
                  >
                    {testStatus === 'testing' ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Test Key</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Feedback */}
                {testMessage && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                      testStatus === 'success'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        : testStatus === 'error'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {testStatus === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span>Flash Model Selection</span>
                </label>
                <div className="space-y-2">
                  {AVAILABLE_MODELS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.model === m.id
                          ? 'border-sky-500 bg-sky-950/30'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="model"
                          value={m.id}
                          checked={formData.model === m.id}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          className="mt-1 accent-sky-500"
                        />
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            <span>{m.name}</span>
                            {m.id === 'gemini-3.8-flash' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-normal">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-emerald-400 font-mono block">{m.speed}</span>
                        <span className="text-[10px] text-slate-500 block">{m.memoryUsage} RAM</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    <span>Temperature: {formData.temperature.toFixed(2)}</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {formData.temperature < 0.4
                      ? 'Precise & Deterministic'
                      : formData.temperature < 0.8
                      ? 'Balanced & Calm'
                      : 'Creative & Expansive'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.0 (Strict factuality)</span>
                  <span>0.7 (Default)</span>
                  <span>1.5 (High creativity)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONALITY & PROMPTS */}
          {activeTab === 'personality' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Winter System Persona</span>
                </label>
                <button
                  onClick={handleResetSystemPrompt}
                  className="text-xs text-sky-400 hover:underline"
                >
                  Reset to default
                </button>
              </div>

              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                rows={9}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed font-mono"
                placeholder="Enter custom instructions for Winter..."
              />
              <p className="text-xs text-slate-400 leading-relaxed">
                Winter is programmed to be calm, intelligent, respectful, and concise. You can customize instructions to shape Winter as a coding assistant, writing editor, daily planner, or tutor.
              </p>
            </div>
          )}

          {/* TAB 3: THEME & UI */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Theme Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Color Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'dark' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      formData.theme === 'dark'
                        ? 'border-sky-500 bg-sky-950/40 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-sky-400" />
                    <span className="font-medium text-sm">Winter Dark (Default)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'light' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      formData.theme === 'light'
                        ? 'border-sky-500 bg-sky-950/40 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-sm">Winter Frost Light</span>
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Chat Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['compact', 'normal', 'relaxed'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({ ...formData, fontSize: size })}
                      className={`capitalize py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        formData.fontSize === size
                          ? 'border-sky-500 bg-sky-950/40 text-sky-300'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Performance Mode / Low Spec Device Optimization */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Ultra-Lightweight Animations</p>
                    <p className="text-[11px] text-slate-400">
                      Disables complex GPU effects for low-spec phones (Huawei P20, iPhone X) and 8GB RAM laptops.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.reducedMotion}
                    onChange={(e) => setFormData({ ...formData, reducedMotion: e.target.checked })}
                    className="accent-sky-500 h-4 w-4 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Install PWA Prompt inside settings */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Progressive Web App
                </label>
                <PWAInstallButton variant="settings" />
              </div>
            </div>
          )}

          {/* TAB 4: DATA & STORAGE */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Local Memory Usage</span>
                  <span className="font-mono text-sky-400 font-semibold">{storageUsage.formatted}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Stored Messages</span>
                  <span className="font-mono text-white font-semibold">{messageCount} messages</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  All chats are saved locally in your browser storage. Nothing is stored on an external database.
                </p>
              </div>

              {/* Export Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export Chat History</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const msgs = JSON.parse(localStorage.getItem('winter_chat_messages_v1') || '[]');
                      exportChatHistory(msgs, 'markdown');
                    }}
                    disabled={messageCount === 0}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-white disabled:opacity-40 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => {
                      const msgs = JSON.parse(localStorage.getItem('winter_chat_messages_v1') || '[]');
                      exportChatHistory(msgs, 'json');
                    }}
                    disabled={messageCount === 0}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-white disabled:opacity-40 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON (.json)</span>
                  </button>
                </div>
              </div>

              {/* Clear History */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <label className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Conversation History</span>
                </label>

                {confirmClear ? (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/70 space-y-2">
                    <p className="text-xs text-rose-200">
                      Are you sure you want to delete all messages? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          clearMessages();
                          onClearHistory();
                          setConfirmClear(false);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-medium text-white transition-colors"
                      >
                        Yes, Delete All
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    disabled={messageCount === 0}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/40 text-xs font-medium text-rose-300 disabled:opacity-40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All Messages</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs sm:text-sm font-medium text-slate-950 transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
