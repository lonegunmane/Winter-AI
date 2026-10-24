import React from 'react';
import { Settings, PanelLeftOpen, MessageSquarePlus, WifiOff, CloudLightning } from 'lucide-react';
import { AppSettings, ServerStatus } from '../types';
import { FrostySnowflakeLogo } from './FrostySnowflakeLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  settings: AppSettings;
  conversationTitle?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onToggleOfflineMode: () => void;
  isGenerating: boolean;
  isOnline: boolean;
  isOfflineModeActive: boolean;
  serverStatus: ServerStatus | null;
}

export const Header: React.FC<HeaderProps> = ({
  settings: _settings,
  conversationTitle = 'Winter',
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  onToggleOfflineMode,
  isGenerating,
  isOfflineModeActive,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 py-2 bg-[#030712]/80 backdrop-blur-md border-b border-sky-950/30 select-none">
      {/* Left: Reopen Sidebar Button & Title */}
      <div className="flex items-center gap-2">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/80 transition-colors"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-slate-300 hover:text-sky-300" />
          </button>
        )}

        {!isSidebarOpen && (
          <button
            onClick={onNewChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/80 transition-colors"
            title="New chat"
            aria-label="New chat"
          >
            <MessageSquarePlus className="w-4 h-4 text-slate-300 hover:text-sky-300" />
          </button>
        )}

        <div className="flex items-center gap-2 ml-1">
          <div className="relative">
            <FrostySnowflakeLogo size={24} spinning={isGenerating} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#030712] ${
                isOfflineModeActive
                  ? 'bg-amber-400'
                  : isGenerating
                  ? 'bg-sky-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
          </div>

          <span className="font-medium text-xs sm:text-sm text-slate-200 truncate max-w-[160px] sm:max-w-[280px]">
            {conversationTitle}
          </span>
        </div>
      </div>

      {/* Right: Engine Pill, Install & Settings */}
      <div className="flex items-center gap-1.5">
        {/* Subtle Mode Switch Pill */}
        <button
          onClick={onToggleOfflineMode}
          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
            isOfflineModeActive
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/50'
              : 'bg-sky-950/40 border-sky-900/50 text-sky-300 hover:bg-sky-900/50'
          }`}
          title={isOfflineModeActive ? 'Offline Local Brain active (tap to switch)' : 'Winter Online active (tap to test offline)'}
        >
          {isOfflineModeActive ? (
            <>
              <WifiOff className="w-2.5 h-2.5 text-amber-400" />
              <span>Offline</span>
            </>
          ) : (
            <>
              <CloudLightning className="w-2.5 h-2.5 text-sky-400" />
              <span>Online</span>
            </>
          )}
        </button>

        <PWAInstallButton />

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/80 transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-slate-400 hover:text-sky-300" />
        </button>
      </div>
    </header>
  );
};
