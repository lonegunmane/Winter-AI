import React, { useRef, useEffect } from 'react';
import { Send, Square, Sparkles } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text?: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  isOnline: boolean;
  showStarters?: boolean;
}

const STARTER_PROMPTS = [
  'Summarize today\'s key priorities calmly and clearly',
  'Draft a polite, concise professional follow-up email',
  'Explain how async/await works under the hood',
  'Give me 3 practical tips for staying focused while working',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isGenerating,
  isOnline,
  showStarters = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea smoothly without thrashing layout
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-3 pt-1">
      {/* Starter Prompts (shown when conversation is new or requested) */}
      {showStarters && (
        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0 px-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Try:</span>
          </span>
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSend(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="relative flex items-end gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-900 border border-slate-700/80 focus-within:border-sky-500/80 focus-within:ring-1 focus-within:ring-sky-500/30 transition-all shadow-lg">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !isOnline
              ? 'Offline mode (cannot reach Gemini API)...'
              : 'Message Winter... (Enter to send, Shift+Enter for newline)'
          }
          disabled={!isOnline && !isGenerating}
          rows={1}
          className="flex-1 max-h-40 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 px-3 py-2 resize-none focus:outline-none leading-relaxed"
        />

        {/* Action Button: Send or Stop */}
        <div className="shrink-0 pb-1 pr-1">
          {isGenerating ? (
            <button
              onClick={onStop}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition-colors flex items-center justify-center shadow-xs"
              title="Stop generating"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => onSend()}
              disabled={!input.trim() || !isOnline}
              className="p-2 sm:p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-medium transition-colors flex items-center justify-center shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-slate-500">
        <span>Winter v1.0 • Low-spec optimized</span>
        <span>Runs locally on your device</span>
      </div>
    </div>
  );
};
