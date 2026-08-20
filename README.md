# ⚡ ApnaGPT

**ApnaGPT** is a personal, blazing-fast ChatGPT-style web app powered by Groq's high-speed LLM inference engine (`llama-3.3-70b-versatile`) with full **Multi-Chat session history** backed by **SQLite** via **Prisma ORM**.

---

## ✨ Features

- ⚡ **Ultra-Fast Real-Time Streaming**: Word-by-word token streaming via Server-Sent Events (SSE) directly from Groq.
- 🗂️ **Multi-Chat Session Management**: Create, switch, rename, and delete multiple conversations stored in SQLite.
- 🏷️ **Smart Auto-Titling**: Automatically generates conversation titles from your very first prompt.
- 💬 **Conversation Context & Memory**: Full chat history loaded from the database and supplied on each turn for seamless follow-up questions.
- 🎨 **Modern ChatGPT-Style UI**: Sleek dark theme with emerald/teal glowing accents, responsive sidebar drawer for desktop and mobile (`100dvh`).
- 🧠 **Markdown & Code Highlighting**: Renders markdown tables, headers, quotes, and syntax-highlighted code blocks with 1-click **Copy Code**.
- ⏳ **Instant Visual Feedback**: 3-pulse thinking indicator while waiting for the first token + blinking trailing cursor while streaming.
- 🛑 **Full Control**: Stop generation mid-stream with `AbortController`, search through chat history, and auto-resizing textarea.
- 🔒 **Secure Proxy Architecture**: Groq API key is stored strictly on the Node.js Express backend and never exposed to the client browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Markdown (`remark-gfm`, `rehype-highlight`).
- **Backend**: Node.js, Express, Groq SDK (`groq-sdk`), Server-Sent Events (SSE).
- **Database & ORM**: SQLite (`dev.db`), Prisma ORM (`@prisma/client`).
- **Default Model**: `llama-3.3-70b-versatile` (configurable via `.env`).

---

## 🚀 Getting Started

### 1. Configure Your Groq API Key
1. Get a free API key from the [Groq Console](https://console.groq.com/keys).
2. Copy `.env.example` to `.env` in `server/` or the project root:

```bash
cp .env.example server/.env
```

3. Open `server/.env` and paste your Groq API key:
```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=5001
```

### 2. Install Dependencies
Run the installer:
```bash
npm run install:all
```

### 3. Run Database Migrations
Run Prisma migrations to initialize your SQLite database:
```bash
npm run db:migrate
# or inside server/: npx prisma migrate dev
```

### 4. Run Locally
Start both the backend server and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend Server**: `http://localhost:5001`
- **Health Check**: `http://localhost:5001/api/health`

---

## 📁 Project Structure

```
Apnagpt/
├── .env.example
├── .gitignore
├── package.json               # Root scripts (runs client + server concurrently)
├── README.md
├── server/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (Chat & Message models)
│   │   └── migrations/        # SQLite migration files
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── db.js              # PrismaClient singleton
│       ├── config.js          # Groq model and server config
│       └── index.js           # Multi-chat CRUD & SSE streaming endpoints
└── client/
    ├── package.json
    ├── vite.config.js         # Vite config with backend /api proxy
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── index.css          # Design system & markdown styles
        ├── main.jsx
        ├── App.jsx            # Multi-chat drawer layout & state
        ├── components/
        │   ├── Sidebar.jsx        # Multi-chat list, search, rename & delete
        │   ├── Header.jsx         # Branding, active chat title & mobile drawer toggle
        │   ├── ChatContainer.jsx  # Starter prompts & message list
        │   ├── MessageBubble.jsx  # Markdown parser & code highlighter with copy
        │   ├── ThinkingDots.jsx   # 3-pulse typing indicator
        │   └── ChatInput.jsx      # Auto-expanding input & Send/Stop button
        ├── hooks/
        │   ├── useChat.js         # Multi-chat state, SSE consumer & DB sync
        │   └── useAutoScroll.js   # Smart auto-scroll logic
        └── utils/
            ├── storage.js         # LocalStorage active chat ID persistence
            └── time.js            # Relative time formatting helper
```

---

## 📜 Available Scripts

- `npm run dev` — Starts both Express backend and Vite frontend concurrently.
- `npm run db:migrate` — Runs Prisma migrations for the SQLite database.
- `npm run install:all` — Installs dependencies and runs initial DB migrations.
- `npm run build` — Builds the production bundle in `client/dist`.

---

## 💡 License
MIT
