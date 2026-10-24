import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, Sparkles } from 'lucide-react';

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
  'Summarize key ideas concisely',
  'Draft a polite follow-up email',
  'Plan a focused workday schedule',
  'Help me review this code logic',
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

  // Auto-resize textarea smoothly without layout shifts
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && input.trim()) {
        onSend();
      }
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 pt-1">
      {/* Starter Prompts */}
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
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Claude/Grok style floating input card */}
      <div className="relative flex items-end gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#0c1424]/90 backdrop-blur-md border border-slate-800 focus-within:border-sky-500/60 transition-all shadow-xl shadow-black/40">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !isOnline
              ? 'Message Winter (Offline Engine)...'
              : 'Message Winter...'
          }
          disabled={isGenerating}
          rows={1}
          className="flex-1 max-h-44 bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 px-3 py-2 resize-none focus:outline-none leading-relaxed"
        />

        {/* Action Button: Send or Stop */}
        <div className="shrink-0 pb-0.5 pr-0.5">
          {isGenerating ? (
            <button
              onClick={onStop}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition-colors flex items-center justify-center shadow-xs"
              title="Stop generating"
              aria-label="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => onSend()}
              disabled={!hasText || isGenerating}
              className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center ${
                hasText
                  ? 'bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-md shadow-sky-500/20 active:scale-95'
                  : 'bg-slate-800/60 text-slate-600 cursor-not-allowed'
              }`}
              title="Send"
              aria-label="Send"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
