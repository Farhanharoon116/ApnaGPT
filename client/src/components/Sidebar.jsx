import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Zap,
  ChevronRight,
  PanelLeftClose,
  Search
} from 'lucide-react';
import { formatRelativeTime } from '../utils/time';

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onRenameChat,
  onDeleteChat,
  isOpen,
  onClose
}) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const editInputRef = useRef(null);

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const handleStartRename = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setDeletingChatId(null);
  };

  const handleSaveRename = (chatId, e) => {
    e?.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e) => {
    e?.stopPropagation();
    setEditingChatId(null);
  };

  const handleStartDelete = (chatId, e) => {
    e.stopPropagation();
    setDeletingChatId(chatId);
    setEditingChatId(null);
  };

  const handleConfirmDelete = (chatId, e) => {
    e.stopPropagation();
    onDeleteChat(chatId);
    setDeletingChatId(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setDeletingChatId(null);
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-72 sm:w-80 bg-[#0b0f17] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!isOpen ? 'lg:hidden' : 'lg:flex'}`}
      >
        {/* Header: Logo & New Chat */}
        <div className="p-3.5 border-b border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                <Zap className="w-4 h-4 fill-current text-emerald-100" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                Apna<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">GPT</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 lg:flex"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onCreateChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-semibold shadow-md shadow-emerald-950/40 hover:shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Chat</span>
          </button>

          {/* Search Box */}
          {chats.length > 5 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 text-gray-200 placeholder-gray-500 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              {searchQuery ? 'No chats match your search.' : 'No conversations yet.'}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = chat.id === editingChatId;
              const isDeleting = chat.id === deletingChatId;

              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    if (!isEditing && !isDeleting) {
                      onSelectChat(chat.id);
                      if (window.innerWidth < 1024) onClose();
                    }
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-surface-50/90 text-white font-medium shadow-sm border border-slate-700/60'
                      : 'text-gray-300 hover:bg-surface-100/50 hover:text-white border border-transparent'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(chat.id, e);
                          if (e.key === 'Escape') handleCancelRename(e);
                        }}
                        className="flex-1 bg-slate-900 border border-emerald-500/80 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={(e) => handleSaveRename(chat.id, e)}
                        className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 text-gray-400 hover:bg-slate-800 rounded"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : isDeleting ? (
                    <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-red-400 font-medium">Delete chat?</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleConfirmDelete(chat.id, e)}
                          className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[11px] rounded font-medium"
                        >
                          Yes
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-gray-300 text-[11px] rounded"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <MessageSquare
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-400'
                          }`}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs truncate">{chat.title}</span>
                          <span className="text-[10px] text-gray-500">
                            {formatRelativeTime(chat.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Hover Action Buttons */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={(e) => handleStartRename(chat, e)}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Rename chat"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleStartDelete(chat.id, e)}
                          className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-gray-500 flex items-center justify-between">
          <span>{chats.length} {chats.length === 1 ? 'chat' : 'chats'} stored</span>
          <span className="font-mono text-[10px] text-emerald-400/80">SQLite</span>
        </div>
      </aside>
    </>
  );
}
