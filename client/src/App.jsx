import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { useChat } from './hooks/useChat';
import { useAutoScroll } from './hooks/useAutoScroll';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    chats,
    activeChatId,
    activeChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    isStreaming,
    createChat,
    selectChat,
    renameChat,
    deleteChat,
    sendMessage,
    stopGenerating
  } = useChat();

  const {
    scrollRef,
    isUserScrolledUp,
    scrollToBottom,
    handleScroll
  } = useAutoScroll([messages, isStreaming]);

  return (
    <div className="flex h-[100dvh] w-full bg-background text-gray-100 overflow-hidden font-sans">
      {/* Multi-Chat Sidebar (Collapsible / Mobile Drawer) */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onCreateChat={createChat}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Header Bar */}
        <Header
          activeChat={activeChat}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onCreateChat={createChat}
          onDeleteActiveChat={deleteChat}
        />

        {/* Chat Scroll Container */}
        <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          <ChatContainer
            chats={chats}
            activeChat={activeChat}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            scrollRef={scrollRef}
            isUserScrolledUp={isUserScrolledUp}
            scrollToBottom={scrollToBottom}
            handleScroll={handleScroll}
            onSendMessage={sendMessage}
            onCreateChat={createChat}
          />
        </main>

        {/* Bottom Input Area */}
        <footer className="w-full flex-shrink-0 bg-surface-200/50 backdrop-blur-sm border-t border-slate-800/40">
          <ChatInput
            onSendMessage={sendMessage}
            isStreaming={isStreaming}
            onStopGenerating={stopGenerating}
          />
        </footer>
      </div>
    </div>
  );
}
