import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Zap, CheckCircle2, AlertTriangle, Menu, Plus, PanelLeft } from 'lucide-react';

export function Header({
  activeChat,
  onToggleSidebar,
  isSidebarOpen,
  onCreateChat,
  onDeleteActiveChat
}) {
  const [serverHealth, setServerHealth] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setServerHealth(data))
      .catch((err) => {
        console.warn('Backend health check failed:', err);
        setServerHealth({ status: 'error', hasApiKey: false, model: 'llama-3.3-70b-versatile' });
      });
  }, []);

  const handleDelete = () => {
    if (activeChat) {
      onDeleteActiveChat(activeChat.id);
    }
    setShowConfirmDelete(false);
  };

  return (
    <header className="w-full bg-surface-200/80 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-20 safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Left: Sidebar Toggle & App Title / Active Chat Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <PanelLeft className="w-5 h-5 text-emerald-400" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-bold text-sm sm:text-base text-white tracking-tight flex-shrink-0">
              Apna<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">GPT</span>
            </h1>

            {activeChat && (
              <>
                <span className="text-gray-600 hidden sm:inline">/</span>
                <span className="text-xs sm:text-sm text-gray-300 font-medium truncate max-w-[150px] sm:max-w-[280px]">
                  {activeChat.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status Badge */}
          {serverHealth && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                serverHealth.hasApiKey
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
              }`}
              title={serverHealth.hasApiKey ? 'AI Assistant Ready' : 'API Key Missing'}
            >
              {serverHealth.hasApiKey ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Personal AI Assistant</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Missing API Key</span>
                </>
              )}
            </div>
          )}

          {/* Quick New Chat Button (visible when sidebar is hidden) */}
          {!isSidebarOpen && (
            <button
              onClick={onCreateChat}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-medium transition-all"
              title="New Chat"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* Delete Active Chat Button */}
          {activeChat && (
            <div className="relative">
              {showConfirmDelete ? (
                <div className="flex items-center gap-1 animate-fade-in">
                  <button
                    onClick={handleDelete}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-all"
                  title="Delete this conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
