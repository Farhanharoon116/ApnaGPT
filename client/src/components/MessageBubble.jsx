import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Bot, User, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import { ThinkingDots } from './ThinkingDots';

export function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`w-full py-4 px-3 sm:px-6 transition-colors duration-150 animate-fade-in ${
        isUser ? 'bg-surface-100/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-gray-200 shadow-sm border border-slate-600/50">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/10 border border-emerald-400/30">
              <Sparkles className="w-4 h-4 text-emerald-100" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-300">
              {isUser ? 'You' : 'ApnaGPT'}
            </span>
            {message.timestamp && (
              <span className="text-[10px] text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Body */}
          {message.isThinking ? (
            <ThinkingDots />
          ) : (
            <div
              className={`prose-custom break-words ${
                message.isStreaming ? 'streaming-cursor' : ''
              } ${message.isError ? 'text-red-400 border border-red-500/30 bg-red-950/20 p-3 rounded-lg' : ''}`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre({ node, children, ...props }) {
                    return <CodeBlock {...props}>{children}</CodeBlock>;
                  },
                  a({ node, children, ...props }) {
                    return (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
                      >
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced CodeBlock with language header & copy button
 */
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  // Extract raw text from pre / code children
  const extractCode = (node) => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractCode).join('');
    if (node.props && node.props.children) return extractCode(node.props.children);
    return '';
  };

  const codeText = extractCode(children);

  // Extract language from code element className (e.g. language-javascript)
  let language = 'code';
  if (React.isValidElement(children) && children.props?.className) {
    const match = /language-(\w+)/.exec(children.props.className || '');
    if (match) {
      language = match[1];
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-slate-800 bg-[#090d14]">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#121824] border-b border-slate-800/80 text-xs text-gray-400 font-mono">
        <span className="font-medium text-slate-300 lowercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-slate-700/60 transition-all"
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
      <div className="p-3.5 overflow-x-auto text-sm">
        <pre className="!bg-transparent !p-0 !m-0 !border-0 font-mono">{children}</pre>
      </div>
    </div>
  );
}
