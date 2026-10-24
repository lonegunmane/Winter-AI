import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Volume2, VolumeX, Edit2 } from 'lucide-react';
import { ChatMessage as ChatMessageType, FontSize } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { WinterLogo } from './WinterLogo';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  fontSize: FontSize;
  onRetry?: (messageId: string) => void;
  onEdit?: (content: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  fontSize,
  onRetry,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.content.replace(/[`*#_[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Font size classes
  const fontClass =
    fontSize === 'compact'
      ? 'text-xs'
      : fontSize === 'relaxed'
      ? 'text-base leading-relaxed'
      : 'text-sm';

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group flex flex-col w-full px-3 sm:px-6 py-2 sm:py-3 transition-colors ${
        isUser ? 'items-end' : 'items-start'
      }`}
    >
      <div className={`flex items-start gap-2.5 max-w-[94%] sm:max-w-[85%] md:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl select-none text-xs font-semibold overflow-hidden ${
            isUser
              ? 'bg-slate-700/80 text-slate-200 border border-slate-600'
              : 'border border-sky-500/30 shadow-xs'
          }`}
        >
          {isUser ? 'You' : <WinterLogo size={32} showGlow={false} />}
        </div>

        {/* Bubble */}
        <div className="flex flex-col space-y-1 min-w-0">
          <div
            className={`rounded-2xl px-4 py-3 shadow-xs break-words ${fontClass} ${
              isUser
                ? 'bg-sky-600 text-white rounded-tr-xs'
                : message.isError
                ? 'bg-rose-950/60 border border-rose-800 text-rose-200 rounded-tl-xs'
                : 'bg-slate-800/80 border border-slate-700/70 text-slate-100 rounded-tl-xs'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            ) : (
              <>
                <MarkdownRenderer content={message.content} />
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-sky-400 animate-pulse align-middle" />
                )}
              </>
            )}
          </div>

          {/* Action Row */}
          <div
            className={`flex items-center gap-1.5 px-1 text-[11px] text-slate-500 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <span>{timeString}</span>

            {!isStreaming && (
              <>
                <span>•</span>
                <button
                  onClick={handleCopy}
                  className="hover:text-slate-300 p-1 rounded"
                  title="Copy message"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>

                {!isUser && 'speechSynthesis' in window && (
                  <button
                    onClick={handleSpeak}
                    className="hover:text-slate-300 p-1 rounded"
                    title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-3 h-3 text-sky-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                  </button>
                )}

                {isUser && onEdit && (
                  <button
                    onClick={() => onEdit(message.content)}
                    className="hover:text-slate-300 p-1 rounded"
                    title="Edit prompt"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}

                {!isUser && onRetry && (
                  <button
                    onClick={() => onRetry(message.id)}
                    className="hover:text-slate-300 p-1 rounded"
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
