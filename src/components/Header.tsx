import React from 'react';
import { Menu, Settings, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { AppSettings, ServerStatus } from '../types';
import { WinterLogo } from './WinterLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  settings: AppSettings;
  conversationTitle?: string;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  isGenerating: boolean;
  isOnline: boolean;
  serverStatus: ServerStatus | null;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  conversationTitle = 'Winter',
  onToggleSidebar,
  onOpenSettings,
  onToggleTheme,
  isGenerating,
  isOnline,
  serverStatus,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 select-none">
      {/* Sidebar Toggle & Branding */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger / Sidebar toggle button */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          title="Toggle navigation sidebar"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <WinterLogo size={32} />
            {/* Status dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                !isOnline
                  ? 'bg-amber-400'
                  : isGenerating
                  ? 'bg-sky-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-sm sm:text-base tracking-tight text-white truncate max-w-[160px] sm:max-w-[280px]">
                {conversationTitle}
              </h1>
              <span className="hidden xs:inline-block text-[10px] px-1.5 py-0.2 rounded bg-sky-950/70 border border-sky-800/60 text-sky-300 font-mono">
                {settings.model.replace('gemini-', '')}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-none mt-0.5 flex items-center gap-1">
              {!isOnline ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <WifiOff className="w-2.5 h-2.5" /> Offline
                </span>
              ) : isGenerating ? (
                <span className="text-sky-300">Winter is typing...</span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                  {serverStatus?.hasServerKey || settings.apiKey ? 'Ready' : 'API Key Setup'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <PWAInstallButton />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-colors"
          title={settings.theme === 'dark' ? 'Switch to Frost Light theme' : 'Switch to Winter Dark theme'}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-sky-400" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-colors"
          title="Open Settings"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
