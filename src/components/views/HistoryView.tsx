import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  Search,
  Trash2,
  Download,
  Calendar,
  Clock,
  ArrowRight,
  Edit2,
  Check,
} from 'lucide-react';
import { Conversation } from '../../types';
import { exportConversation } from '../../utils/storage';

interface HistoryViewProps {
  conversations: Conversation[];
  activeConvoId: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  conversations,
  activeConvoId,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = conversations.filter((c) => {
    const matchTitle = c.title.toLowerCase().includes(search.toLowerCase());
    const matchMessages = c.messages.some((m) =>
      m.content.toLowerCase().includes(search.toLowerCase())
    );
    return matchTitle || matchMessages;
  });

  const handleStartRename = (convo: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(convo.id);
    setEditTitle(convo.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Chat History</h2>
            <p className="text-xs text-slate-400">
              Manage past sessions, search logs, and export conversations
            </p>
          </div>
        </div>

        {/* Clear All action */}
        {conversations.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300">Delete all chats?</span>
                <button
                  onClick={onClearAll}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Sessions</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by topic, keyword, or past message..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Conversations Grid / List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          No conversations found matching your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((convo) => {
            const isActive = convo.id === activeConvoId;
            const isEditing = editingId === convo.id;
            const messageCount = convo.messages.length;
            const lastMessage =
              convo.messages.length > 0
                ? convo.messages[convo.messages.length - 1].content
                : 'No messages in this chat yet';

            return (
              <div
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-950/40 border-sky-600/80'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(convo.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                            className="bg-slate-950 border border-sky-500 rounded px-2 py-0.5 text-xs text-white"
                          />
                          <button
                            type="submit"
                            className="p-1 text-emerald-400 hover:text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <h3 className="font-semibold text-sm text-white truncate flex items-center gap-2">
                          <span>{convo.title}</span>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-normal">
                              Active
                            </span>
                          )}
                        </h3>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {lastMessage}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{messageCount} messages</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(convo.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(convo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 shrink-0"
                  >
                    <button
                      onClick={(e) => handleStartRename(convo, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Rename conversation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => exportConversation(convo, 'markdown')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Export as Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => onDeleteConversation(convo.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectConversation(convo.id)}
                      className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors"
                      title="Open conversation"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
