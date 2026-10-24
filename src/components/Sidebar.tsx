import React from 'react';
import {
  MessageSquarePlus,
  History,
  Settings,
  Brain,
  Wrench,
  Info,
  X,
  Trash2,
  ChevronRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Conversation, SidebarTab } from '../types';
import { WinterLogo } from './WinterLogo';
import { isNativeApp } from '../utils/capacitorBridge';

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
  isOnline,
}) => {
  const isCapacitor = isNativeApp();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 sm:w-80 bg-slate-950 border-r border-slate-800/80 transition-transform duration-200 ease-out select-none shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <WinterLogo size={36} />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-base tracking-tight text-white">Winter</h2>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-950/70 border border-sky-800/60 text-sky-300">
                  {isCapacitor ? 'APK' : 'PWA'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Personal AI Assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action: New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-950/50 transition-all active:scale-[0.98]"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Catalogue Navigation Links */}
        <div className="px-3 py-1 space-y-1 text-xs sm:text-sm">
          {/* Chat History Header / Tab */}
          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-sky-400" />
              <span>Chat History</span>
            </div>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
              {conversations.length}
            </span>
          </button>

          {/* Memory / Notes */}
          <button
            onClick={() => {
              onSelectTab('memory');
              if (window.innerWidth < 768) onClose();
            }}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'memory'
                ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Memory &amp; Notes</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Tools & Hardware Bridge */}
          <button
            onClick={() => {
              onSelectTab('tools');
              if (window.innerWidth < 768) onClose();
            }}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'tools'
                ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Tools &amp; Native Bridge</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              onSelectTab('settings');
              if (window.innerWidth < 768) onClose();
            }}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-sky-400" />
              <span>Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* About Winter */}
          <button
            onClick={() => {
              onSelectTab('about');
              if (window.innerWidth < 768) onClose();
            }}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-blue-400" />
              <span>About Winter (APK Guide)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Conversation List Drawer inside sidebar */}
        <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-slate-800/80 mt-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recent Conversations
          </div>

          {conversations.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              No conversations yet. Tap New Chat to begin.
            </div>
          ) : (
            conversations.map((convo) => {
              const isActive = convo.id === activeConvoId && activeTab === 'chat';
              const messagePreview =
                convo.messages.length > 0
                  ? convo.messages[convo.messages.length - 1].content.slice(0, 36)
                  : 'Empty conversation';

              return (
                <div
                  key={convo.id}
                  onClick={() => {
                    onSelectConversation(convo.id);
                    onSelectTab('chat');
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between p-2 rounded-xl text-left cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-sky-950/60 border border-sky-800/80 text-white'
                      : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-1">
                    <p className="text-xs font-medium truncate text-white">
                      {convo.title || 'Untitled Conversation'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {messagePreview}
                    </p>
                  </div>

                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => onDeleteConversation(convo.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer / System Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">System Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-400">Offline Shell</span>
              </>
            )}
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            {isCapacitor ? 'Capacitor Android' : 'v1.1 PWA'}
          </span>
        </div>
      </aside>
    </>
  );
};
