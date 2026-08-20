import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Sparkles } from 'lucide-react';

export function ChatInput({ onSendMessage, isStreaming, onStopGenerating }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
    textareaRef.current.style.height = `${newHeight}px`;
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) {
      onStopGenerating();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Refocus textarea on desktop
      if (window.innerWidth > 768) {
        textareaRef.current.focus();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-3 pt-1 safe-bottom">
      <div className="relative rounded-2xl bg-surface-100/90 border border-slate-700/60 shadow-xl backdrop-blur-md transition-all focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/50">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask ApnaGPT anything... (Shift+Enter for newline)"
          rows={1}
          disabled={isStreaming}
          className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-sm sm:text-base px-4 py-3.5 pr-14 focus:outline-none resize-none max-h-[200px] overflow-y-auto leading-relaxed disabled:opacity-60"
        />

        {/* Action Button: Send or Stop */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopGenerating}
              className="p-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white transition-all shadow-md active:scale-95 group"
              title="Stop Generating"
            >
              <Square className="w-4 h-4 fill-current group-hover:scale-95 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={`p-2 rounded-xl transition-all shadow-md active:scale-95 ${
                input.trim()
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white hover:opacity-90 hover:shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 px-2 pt-1.5 font-normal">
        <span className="hidden sm:inline">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-gray-400 font-mono text-[10px]">Enter ↵</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-gray-400 font-mono text-[10px]">Shift + Enter</kbd> for newline
        </span>
        <span className="text-gray-500 sm:ml-auto">
          ApnaGPT can make mistakes. Verify important info.
        </span>
      </div>
    </div>
  );
}
