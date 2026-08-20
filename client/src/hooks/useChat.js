import { useState, useEffect, useRef, useCallback } from 'react';
import { getSavedActiveChatId, saveActiveChatId } from '../utils/storage.js';

export function useChat() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(() => getSavedActiveChatId());
  const [messages, setMessages] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  // Sync activeChatId to localStorage
  useEffect(() => {
    saveActiveChatId(activeChatId);
  }, [activeChatId]);

  // 1. Fetch all chats on initial load
  const fetchChats = useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const res = await fetch('/api/chats');
      if (!res.ok) throw new Error('Failed to fetch chats');
      const data = await res.json();
      setChats(data);

      // If activeChatId exists in the list, keep it; otherwise select the first chat if available
      if (data.length > 0) {
        setActiveChatId((prev) => {
          const exists = data.some((c) => c.id === prev);
          return exists ? prev : data[0].id;
        });
      } else {
        setActiveChatId(null);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
      setError(err.message);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // 2. Fetch messages whenever activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    let isSubscribed = true;

    async function loadChatMessages() {
      try {
        setIsLoadingMessages(true);
        const res = await fetch(`/api/chats/${activeChatId}`);
        if (!res.ok) {
          if (res.status === 404) {
            // Chat was deleted or not found
            setActiveChatId(null);
            setMessages([]);
            return;
          }
          throw new Error('Failed to load chat conversation');
        }
        const data = await res.json();
        if (isSubscribed) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
        if (isSubscribed) {
          setError(err.message);
        }
      } finally {
        if (isSubscribed) {
          setIsLoadingMessages(false);
        }
      }
    }

    loadChatMessages();

    return () => {
      isSubscribed = false;
    };
  }, [activeChatId]);

  // Abort active stream helper
  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant') {
        return [
          ...prev.slice(0, -1),
          { ...last, isThinking: false, isStreaming: false }
        ];
      }
      return prev;
    });
  }, []);

  // 3. Create a new chat
  const createChat = useCallback(async (customTitle = 'New Chat') => {
    if (isStreaming) {
      stopGenerating();
    }
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: customTitle })
      });
      if (!res.ok) throw new Error('Failed to create new chat');
      const newChat = await res.json();
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setMessages([]);
      return newChat;
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError(err.message);
      return null;
    }
  }, [isStreaming, stopGenerating]);

  // 4. Switch active chat
  const selectChat = useCallback((id) => {
    if (id === activeChatId) return;
    if (isStreaming) {
      stopGenerating();
    }
    setActiveChatId(id);
    setError(null);
  }, [activeChatId, isStreaming, stopGenerating]);

  // 5. Rename chat
  const renameChat = useCallback(async (id, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed })
      });
      if (!res.ok) throw new Error('Failed to rename chat');
      const updated = await res.json();
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: updated.title, updatedAt: updated.updatedAt } : c))
      );
    } catch (err) {
      console.error('Error renaming chat:', err);
      setError(err.message);
    }
  }, []);

  // 6. Delete chat
  const deleteChat = useCallback(async (id) => {
    if (isStreaming && activeChatId === id) {
      stopGenerating();
    }
    try {
      const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete chat');

      setChats((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (activeChatId === id) {
          const nextActive = remaining.length > 0 ? remaining[0].id : null;
          setActiveChatId(nextActive);
        }
        return remaining;
      });
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError(err.message);
    }
  }, [activeChatId, isStreaming, stopGenerating]);

  // 7. Send message with streaming and DB persistence
  const sendMessage = useCallback(async (userText) => {
    const trimmed = userText.trim();
    if (!trimmed || isStreaming) return;

    setError(null);

    let targetChatId = activeChatId;

    // If no active chat exists, create one first
    if (!targetChatId) {
      const newChat = await createChat();
      if (!newChat) return;
      targetChatId = newChat.id;
    }

    const tempUserId = 'usr_' + Date.now();
    const tempAsstId = 'asst_' + (Date.now() + 1);

    const userMessage = {
      id: tempUserId,
      chatId: targetChatId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString()
    };

    const placeholderAssistant = {
      id: tempAsstId,
      chatId: targetChatId,
      role: 'assistant',
      content: '',
      isThinking: true,
      isStreaming: true,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage, placeholderAssistant]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: targetChatId,
          message: trimmed
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errText = `Server returned HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson.error) errText = errJson.error;
        } catch (_) {}
        throw new Error(errText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';
      let hasReceivedFirstToken = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

          const dataStr = trimmedLine.slice(5).trim();
          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);

            if (parsed.type === 'title_update') {
              // Update title in sidebar chat list immediately
              setChats((prev) =>
                prev.map((c) => (c.id === parsed.chatId ? { ...c, title: parsed.title } : c))
              );
              continue;
            }

            if (parsed.error) {
              accumulatedText = parsed.error;
              hasReceivedFirstToken = true;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAsstId
                    ? { ...m, isThinking: false, isStreaming: false, content: accumulatedText, isError: true }
                    : m
                )
              );
              break;
            }

            if (parsed.content) {
              accumulatedText += parsed.content;
              hasReceivedFirstToken = true;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAsstId
                    ? { ...m, isThinking: false, isStreaming: true, content: accumulatedText }
                    : m
                )
              );
            }
          } catch (jsonErr) {
            console.warn('SSE parse error:', dataStr, jsonErr);
          }
        }
      }

      // Stream finalized
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAsstId
            ? {
                ...m,
                isThinking: false,
                isStreaming: false,
                content: accumulatedText || (!hasReceivedFirstToken ? '*(No response received)*' : accumulatedText)
              }
            : m
        )
      );

      // Re-fetch chat list to reflect updated updatedAt sorting
      const chatsRes = await fetch('/api/chats');
      if (chatsRes.ok) {
        const updatedChats = await chatsRes.json();
        setChats(updatedChats);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream generation cancelled by user.');
      } else {
        console.error('Chat stream error:', err);
        setError(err.message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAsstId
              ? {
                  ...m,
                  isThinking: false,
                  isStreaming: false,
                  content: `❌ **Failed to generate response:** ${err.message || 'Network error.'}`,
                  isError: true
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [activeChatId, createChat, isStreaming]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  return {
    chats,
    activeChatId,
    activeChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    isStreaming,
    error,
    createChat,
    selectChat,
    renameChat,
    deleteChat,
    sendMessage,
    stopGenerating
  };
}
