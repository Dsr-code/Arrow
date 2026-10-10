import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  return (
    <div className="my-2.5 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-sm text-xs font-mono">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
        <span className="font-semibold uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs leading-relaxed text-slate-200 selection:bg-blue-600">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Parse content into blocks: code blocks vs markdown text
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderTextMarkdown(textBefore, `text-${lastIndex}`));
    }

    const language = match[1] || 'text';
    const code = match[2];
    parts.push(
      <CodeBlock
        key={`code-${match.index}`}
        language={language}
        code={code.replace(/\n$/, '')}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  const remaining = content.substring(lastIndex);
  if (remaining) {
    parts.push(renderTextMarkdown(remaining, `text-${lastIndex}`));
  }

  return <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">{parts}</div>;
}

function renderTextMarkdown(text: string, keyPrefix: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`${keyPrefix}-h3-${i}`} className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-2 mb-1">
          {parseInline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`${keyPrefix}-h2-${i}`} className="font-extrabold text-base text-slate-900 dark:text-white mt-2.5 mb-1">
          {parseInline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`${keyPrefix}-h1-${i}`} className="font-black text-lg text-slate-900 dark:text-white mt-3 mb-1">
          {parseInline(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`${keyPrefix}-bq-${i}`} className="border-l-2 border-blue-500 pl-3 my-1 italic text-slate-600 dark:text-slate-300">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      elements.push(
        <div key={`${keyPrefix}-li-${i}`} className="flex items-start gap-2 ml-1 my-0.5">
          <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
          <span className="flex-1">{parseInline(line.replace(/^[-*]\s+/, ''))}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const matchNum = line.match(/^(\d+)\.\s+(.*)/);
      if (matchNum) {
        elements.push(
          <div key={`${keyPrefix}-oli-${i}`} className="flex items-start gap-2 ml-1 my-0.5">
            <span className="text-blue-600 dark:text-sky-400 font-bold shrink-0 text-[11px] mt-0.5">{matchNum[1]}.</span>
            <span className="flex-1">{parseInline(matchNum[2])}</span>
          </div>
        );
        continue;
      }
    }

    // Empty line / paragraph break
    if (!line.trim()) {
      elements.push(<div key={`${keyPrefix}-gap-${i}`} className="h-1.5" />);
      continue;
    }

    // Regular line
    elements.push(
      <p key={`${keyPrefix}-p-${i}`} className="my-0.5">
        {parseInline(line)}
      </p>
    );
  }

  return <React.Fragment key={keyPrefix}>{elements}</React.Fragment>;
}

function parseInline(text: string): React.ReactNode {
  // Tokenize inline elements: `code`, **bold**, *italic*, [link](url)
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Inline code `...`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(
        <code
          key={`inline-code-${keyIdx++}`}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 font-mono text-[11px] sm:text-xs text-blue-600 dark:text-sky-300"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold **...**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      tokens.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold text-slate-900 dark:text-white">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic *...* or _..._
    const italicMatch = remaining.match(/^(\*|_)([^*_]+)\1/);
    if (italicMatch) {
      tokens.push(
        <em key={`italic-${keyIdx++}`} className="italic">
          {italicMatch[2]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Link [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      tokens.push(
        <a
          key={`link-${keyIdx++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-sky-400 hover:underline font-medium"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Plain text up to next special character
    const nextSpecial = remaining.search(/[`*_\[]/);
    if (nextSpecial === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Just take the single character if none of regexes matched
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      tokens.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return <>{tokens}</>;
}
