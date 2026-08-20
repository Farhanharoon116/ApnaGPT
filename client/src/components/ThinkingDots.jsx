import React from 'react';

export function ThinkingDots() {
  return (
    <div className="flex items-center space-x-1.5 py-1 px-1" aria-label="Thinking...">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
      <span className="text-xs text-emerald-300/80 font-medium ml-2 select-none">Thinking...</span>
    </div>
  );
}
