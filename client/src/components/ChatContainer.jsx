import React from 'react';
import { Sparkles, MessageSquare, Code, Lightbulb, Compass, ArrowDown, Plus, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

const STARTER_PROMPTS = [
  {
    icon: Code,
    title: 'Write a React Hook',
    prompt: 'Write a custom React hook for debouncing input values with full TypeScript support.'
  },
  {
    icon: Lightbulb,
    title: 'Explain a Concept',
    prompt: 'Explain how Server-Sent Events (SSE) differ from WebSockets with real-world examples.'
  },
  {
    icon: Compass,
    title: 'Brainstorm Ideas',
    prompt: 'Give me 5 high-impact AI product ideas combining real-time streaming with intelligent agents.'
  },
  {
    icon: Sparkles,
    title: 'Debug or Optimize Code',
    prompt: 'How do I optimize a slow Node.js Express backend experiencing high event-loop lag?'
  }
];

export function ChatContainer({
  chats,
  activeChat,
  messages,
  isLoadingMessages,
  scrollRef,
  isUserScrolledUp,
  scrollToBottom,
  handleScroll,
  onSendMessage,
  onCreateChat
}) {
  // 1. If there are zero chats at all, show prominent "Start a New Chat" prompt
  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-5 border border-emerald-400/20">
          <MessageSquare className="w-8 h-8 text-emerald-100" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Welcome to ApnaGPT
        </h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          Your personal ChatGPT-style AI assistant with persistent conversation history.
        </p>
        <button
          onClick={() => onCreateChat()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Start a New Chat</span>
        </button>
      </div>
    );
  }

  // 2. If loading messages for an active chat
  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span className="text-sm">Loading conversation...</span>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto w-full relative scroll-smooth"
    >
      {messages.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
          {/* Hero Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-5 border border-emerald-400/20">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-100" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
            How can I help you today?
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-md mb-8">
            ApnaGPT is your intelligent AI assistant. Ask questions, write code, brainstorm, or explore ideas.
          </p>

          {/* Starter Prompt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {STARTER_PROMPTS.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => onSendMessage(item.prompt)}
                  className="flex flex-col items-start p-3.5 rounded-xl bg-surface-100/70 hover:bg-surface-50/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group shadow-sm hover:shadow-md hover:shadow-emerald-500/5 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-400 group-hover:text-emerald-300">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-2 pb-6 flex flex-col">
          {messages.map((message) => (
            <MessageBubble key={message.id || message.createdAt} message={message} />
          ))}
        </div>
      )}

      {/* Floating Scroll to Bottom Button */}
      {isUserScrolledUp && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-24 right-6 p-2.5 rounded-full bg-surface-50 border border-slate-700 text-gray-300 hover:text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 animate-slide-up z-10"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
