import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split into code blocks vs standard text
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose-winter text-sm sm:text-base leading-relaxed space-y-2">
      {parts.map((part, index) => {
        if (!part) return null;

        // Check if it's a code block
        if (part.startsWith('```') && part.endsWith('```')) {
          const match = part.match(/^```([a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
          const lang = match ? match[1] || 'code' : 'code';
          const code = match ? match[2] : part.slice(3, -3);

          return <CodeBlock key={index} code={code} language={lang} />;
        }

        // Otherwise parse normal lines / paragraphs
        return <TextBlock key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400 select-none">
        <span className="uppercase font-semibold tracking-wider text-[11px] text-sky-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto overflow-y-hidden max-h-96">
        <pre className="whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const TextBlock: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((p, pIndex) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        // Headings
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={pIndex} className="text-base sm:text-lg font-semibold text-sky-200 mt-3 mb-1">
              {formatInline(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={pIndex} className="text-lg sm:text-xl font-bold text-sky-100 mt-4 mb-2">
              {formatInline(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={pIndex} className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2">
              {formatInline(trimmed.slice(2))}
            </h2>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={pIndex} className="border-l-2 border-sky-400 pl-3 my-2 text-slate-300 italic">
              {formatInline(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Bullet lists
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
        if (isBulletList) {
          return (
            <ul key={pIndex} className="list-disc pl-5 my-2 space-y-1">
              {lines.map((line, lIndex) => (
                <li key={lIndex}>
                  {formatInline(line.trim().replace(/^[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered lists
        const isNumberedList = lines.every((line) => /^\d+\.\s+/.test(line.trim()));
        if (isNumberedList) {
          return (
            <ol key={pIndex} className="list-decimal pl-5 my-2 space-y-1">
              {lines.map((line, lIndex) => (
                <li key={lIndex}>
                  {formatInline(line.trim().replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Mixed lines in paragraph (render with <br /> if newline without double return)
        return (
          <p key={pIndex} className="my-1.5">
            {lines.map((line, lIndex) => (
              <React.Fragment key={lIndex}>
                {formatInline(line)}
                {lIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
};

// Lightweight inline formatter for bold, italic, inline code, and URLs
function formatInline(str: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Tokenize inline code (`code`), bold (**bold**), italic (*italic*), and links ([title](url))
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(str.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(<strong key={match.index} className="font-semibold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(<em key={match.index} className="italic">{token.slice(1, -1)}</em>);
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        tokens.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        tokens.push(token);
      }
    } else if (token.startsWith('http')) {
      tokens.push(
        <a
          key={match.index}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 underline underline-offset-2 hover:text-sky-300 break-all"
        >
          {token}
        </a>
      );
    } else {
      tokens.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < str.length) {
    tokens.push(str.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : [str];
}
