import React from 'react';
import {
  MessageSquarePlus,
  History,
  Brain,
  Settings,
  Info,
  Trash2,
  PanelLeftClose,
} from 'lucide-react';
import { Conversation, SidebarTab } from '../types';
import { FrostySnowflakeLogo } from './FrostySnowflakeLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  conversations: Conversation[];
  activeConvoId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  isOnline: boolean;
  isOfflineModeActive: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  conversations,
  activeConvoId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOfflineModeActive,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Sidebar Container (Grok & Claude style: dark space black with subtle frost border) */}
      <aside className="fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 sm:w-72 bg-[#030712] border-r border-sky-950/40 select-none shadow-2xl md:shadow-none transition-all duration-200 ease-in-out shrink-0">
        {/* Sidebar Header with Re-collapse button */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-900/90">
          <div className="flex items-center gap-2.5">
            <FrostySnowflakeLogo size={30} />
            <span className="font-semibold text-sm tracking-tight text-white">Winter</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Hide sidebar"
            aria-label="Hide sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-slate-400 hover:text-sky-300" />
          </button>
        </div>

        {/* Primary Action: New Chat */}
        <div className="p-3 pb-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-200 hover:text-white text-xs font-medium transition-all active:scale-[0.98] shadow-xs"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-sky-400" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Minimal Navigation: 5 items only */}
        <div className="px-3 py-1 space-y-0.5 text-xs">
          {/* History */}
          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-sky-950/50 text-sky-300 border border-sky-900/40'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-sky-400/80" />
              <span>History</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-500 font-mono">
              {conversations.length}
            </span>
          </button>

          {/* Memory */}
          <button
            onClick={() => {
              onSelectTab('memory');
              if (window.innerWidth < 768) onClose();
            }}
            className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'memory'
                ? 'bg-sky-950/50 text-sky-300 border border-sky-900/40'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-sky-400/80" />
              <span>Memory</span>
            </div>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              onSelectTab('settings');
              if (window.innerWidth < 768) onClose();
            }}
            className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-sky-950/50 text-sky-300 border border-sky-900/40'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-sky-400/80" />
              <span>Settings</span>
            </div>
          </button>

          {/* About */}
          <button
            onClick={() => {
              onSelectTab('about');
              if (window.innerWidth < 768) onClose();
            }}
            className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-sky-950/50 text-sky-300 border border-sky-900/40'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-400/80" />
              <span>About</span>
            </div>
          </button>
        </div>

        {/* Recent Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-slate-900/80 mt-2 space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Recent Chats
          </div>

          {conversations.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-600">
              No recent chats
            </div>
          ) : (
            conversations.map((convo) => {
              const isActive = convo.id === activeConvoId && activeTab === 'chat';
              return (
                <div
                  key={convo.id}
                  onClick={() => {
                    onSelectConversation(convo.id);
                    onSelectTab('chat');
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-sky-950/60 text-sky-200 border border-sky-900/50'
                      : 'hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <p className="text-xs truncate flex-1 pr-1">
                    {convo.title || 'New Conversation'}
                  </p>

                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => onDeleteConversation(convo.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Minimal Footer */}
        <div className="p-3 border-t border-slate-900/80 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOfflineModeActive ? 'bg-amber-400' : 'bg-sky-400'
              }`}
            />
            <span className="text-slate-400">
              {isOfflineModeActive ? 'Winter Offline' : 'Winter Online'}
            </span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">v1.0</span>
        </div>
      </aside>
    </>
  );
};
