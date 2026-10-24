import React, { useState } from 'react';
import { Brain, Plus, Trash2, FileEdit, Check, Sparkles, StickyNote } from 'lucide-react';
import { UserMemoryItem } from '../../types';
import { loadScratchpad, saveScratchpad } from '../../utils/storage';

interface MemoryViewProps {
  memoryItems: UserMemoryItem[];
  onSaveMemory: (items: UserMemoryItem[]) => void;
  enableMemoryInjection: boolean;
  onToggleMemoryInjection: (enabled: boolean) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memoryItems,
  onSaveMemory,
  enableMemoryInjection,
  onToggleMemoryInjection,
}) => {
  const [scratchpad, setScratchpad] = useState<string>(() => loadScratchpad());
  const [scratchpadSaved, setScratchpadSaved] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<UserMemoryItem['category']>('preference');
  const [isAdding, setIsAdding] = useState(false);

  const handleSaveScratchpad = () => {
    saveScratchpad(scratchpad);
    setScratchpadSaved(true);
    setTimeout(() => setScratchpadSaved(false), 2000);
  };

  const handleAddMemory = () => {
    if (!newContent.trim()) return;
    const newItem: UserMemoryItem = {
      id: `mem_${Date.now()}`,
      category: newCategory,
      content: newContent.trim(),
      createdAt: Date.now(),
    };
    onSaveMemory([...memoryItems, newItem]);
    setNewContent('');
    setIsAdding(false);
  };

  const handleDeleteMemory = (id: string) => {
    onSaveMemory(memoryItems.filter((item) => item.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Memory &amp; Notes</h2>
            <p className="text-xs text-slate-400">Personal facts and custom notes Winter remembers</p>
          </div>
        </div>

        {/* Memory Injection Switch */}
        <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={enableMemoryInjection}
            onChange={(e) => onToggleMemoryInjection(e.target.checked)}
            className="accent-emerald-400 h-4 w-4 rounded"
          />
          <span className="text-slate-300 font-medium">Inject Memory into Winter&apos;s Context</span>
        </label>
      </div>

      {/* Persistent Scratchpad */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Quick Scratchpad</h3>
          </div>
          <button
            onClick={handleSaveScratchpad}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium text-xs transition-colors shadow-xs"
          >
            {scratchpadSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <span>Save Note</span>
            )}
          </button>
        </div>
        <textarea
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          placeholder="Jot down quick thoughts, temporary ideas, or snippets. Automatically preserved locally."
          rows={4}
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed font-mono"
        />
      </div>

      {/* Memory Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Learned Facts &amp; Preferences ({memoryItems.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Winter uses these points to tailor responses without you having to repeat them.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>

        {/* Add Memory Form */}
        {isAdding && (
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as UserMemoryItem['category'])}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="preference">Preference</option>
                <option value="fact">Fact about me</option>
                <option value="goal">Goal / Project</option>
                <option value="note">General Note</option>
              </select>
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="e.g. 'I am building an Android APK using Capacitor and prefer concise code'"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddMemory();
                }}
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg"
              >
                Save Fact
              </button>
            </div>
          </div>
        )}

        {/* Memory Items List */}
        {memoryItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No memories stored yet. Add facts or preferences to personalize Winter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memoryItems.map((item) => (
              <div
                key={item.id}
                className="group relative p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 flex flex-col justify-between space-y-2 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-sky-400">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleDeleteMemory(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="leading-relaxed">{item.content}</p>
                <p className="text-[10px] text-slate-500">
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
