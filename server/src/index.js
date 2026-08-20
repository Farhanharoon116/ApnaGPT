import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import { config } from './config.js';
import { prisma } from './db.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health and configuration endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'ApnaGPT',
    model: config.groqModel,
    hasApiKey: Boolean(config.groqApiKey && config.groqApiKey.trim().length > 0 && !config.groqApiKey.includes('your_groq_api_key')),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// Chat Session Management (CRUD)
// ==========================================

// 1. Create a new chat session
app.post('/api/chats', async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await prisma.chat.create({
      data: {
        title: title && title.trim().length > 0 ? title.trim() : 'New Chat'
      },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
    res.status(201).json(chat);
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ error: 'Failed to create chat session.' });
  }
});

// 2. List all chats (sorted by most recently updated)
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
    res.json(chats);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to retrieve chat list.' });
  }
});

// 3. Get single chat by ID with full message history
app.get('/api/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found.' });
    }

    res.json(chat);
  } catch (err) {
    console.error('Error fetching chat:', err);
    res.status(500).json({ error: 'Failed to retrieve chat.' });
  }
});

// 4. Rename a chat
app.patch('/api/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }

    const updated = await prisma.chat.update({
      where: { id },
      data: { title: title.trim() }
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating chat:', err);
    res.status(500).json({ error: 'Failed to update chat title.' });
  }
});

// 5. Delete a chat and all its messages
app.delete('/api/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.chat.delete({
      where: { id }
    });
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(500).json({ error: 'Failed to delete chat.' });
  }
});

// ==========================================
// Streaming Chat Endpoint with DB Persistence
// ==========================================
app.post('/api/chat', async (req, res) => {
  const { chatId, message } = req.body;

  if (!chatId) {
    return res.status(400).json({ error: 'Invalid request: "chatId" is required.' });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Invalid request: "message" text is required.' });
  }

  const trimmedMessage = message.trim();

  // Verify chat exists
  let chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!chat) {
    return res.status(404).json({ error: 'Chat session not found.' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const sendSSE = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const sendErrorSSE = (errorMessage) => {
    sendSSE({ error: errorMessage });
    res.write('data: [DONE]\n\n');
    res.end();
  };

  // Check Groq API key
  const apiKey = config.groqApiKey?.trim();
  if (!apiKey || apiKey.includes('your_groq_api_key')) {
    sendErrorSSE(
      '⚠️ **Groq API Key Missing:** Please add your valid `GROQ_API_KEY` to the `.env` file in the server directory, then restart the server.\n\nYou can obtain a free API key at [https://console.groq.com/keys](https://console.groq.com/keys).'
    );
    return;
  }

  // Save User Message to Database
  const savedUserMessage = await prisma.message.create({
    data: {
      chatId,
      role: 'user',
      content: trimmedMessage
    }
  });

  // Auto-generate chat title from first prompt if needed
  let updatedTitle = chat.title;
  if (chat.messages.length === 0 || chat.title === 'New Chat') {
    // Generate clean short title (up to 35 chars)
    const cleaned = trimmedMessage.replace(/[\n\r]+/g, ' ').trim();
    updatedTitle = cleaned.length > 35 ? cleaned.slice(0, 35) + '...' : cleaned;
    await prisma.chat.update({
      where: { id: chatId },
      data: { title: updatedTitle }
    });
    sendSSE({ type: 'title_update', title: updatedTitle, chatId });
  }

  // Build full message history for Groq
  const fullHistory = [
    ...chat.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: trimmedMessage }
  ];

  const formattedMessages = [
    { role: 'system', content: config.systemPrompt },
    ...fullHistory
  ];

  const groq = new Groq({ apiKey });
  let isAborted = false;

  req.on('close', () => {
    isAborted = true;
  });

  let accumulatedText = '';

  try {
    const stream = await groq.chat.completions.create({
      model: config.groqModel,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: true
    });

    for await (const chunk of stream) {
      if (isAborted) {
        break;
      }
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        accumulatedText += token;
        sendSSE({ content: token });
      }
    }

    // Save Assistant Response to Database if accumulated text exists
    if (accumulatedText) {
      await prisma.message.create({
        data: {
          chatId,
          role: 'assistant',
          content: accumulatedText
        }
      });
      // Touch updatedAt timestamp on Chat
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });
    }

    if (!isAborted) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    console.error('Groq API Streaming Error:', err);
    if (!isAborted && !res.writableEnded) {
      const errorMsg = err?.message || 'An unexpected error occurred while communicating with the Groq API.';
      sendErrorSSE(`❌ **Error from Groq:** ${errorMsg}`);
    }
  }
});

app.listen(config.port, () => {
  console.log(`⚡ ApnaGPT Server running on http://localhost:${config.port}`);
  console.log(`🤖 Configured Model: ${config.groqModel}`);
  console.log(`🔑 API Key Status: ${config.groqApiKey ? 'Detected' : 'Missing (set GROQ_API_KEY in .env)'}`);
  console.log(`🗄️ Database: SQLite via Prisma ORM connected`);
});
