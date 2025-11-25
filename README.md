# 📧 Prompt-Driven Email Productivity Agent

An intelligent email management system powered by Google Gemini AI for categorization, summarization, and intelligent reply generation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

---

## ✨ Features

- 🤖 **AI-Powered Processing**: Email categorization, summarization, action extraction, and intelligent reply generation
- 📝 **Customizable Prompts**: Create and manage prompt templates for your workflow
- 💬 **Interactive Chat Agent**: Get contextual assistance with email-related queries
- 📌 **Smart Organization**: Pin, archive, and manage emails efficiently
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode support
- 💾 **Draft Management**: Save and edit reply drafts (never auto-sends)

---

## 🛠️ Tech Stack

**Backend**: Node.js, Express.js, TypeScript, SQLite, Google Gemini API  
**Frontend**: React, TypeScript, Vite, Tailwind CSS

---

## 📋 Prerequisites

- Node.js (v18+)
- npm (v9+)
- Google Gemini API Key (optional - works with mock LLM by default)

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd OceanAI
npm run install:all
```

### 2. Configure Environment

Create `backend/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-api-key-here  # Optional
GEMINI_MODEL=gemini-pro            # Optional
USE_MOCK_LLM=false                 # Set to true to use mock LLM
```

### 3. Run Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

Open `http://localhost:3000` in your browser.

---

## 📖 Usage

### Email Actions
Select an email and use the action buttons:
- **📋 Categorize**: Classify email into categories
- **✅ Extract Actions**: Identify actionable items
- **✍️ Draft Reply**: Generate context-aware reply
- **📝 Summarize**: Get concise summary
- **⚡ Assess Priority**: Determine urgency level

### Prompt Brain
Navigate to **Prompt Brain** to create, edit, and manage custom prompt templates.

### Draft Manager
Generated replies automatically load into the Draft Manager. Edit and save drafts (they never auto-send).

### Email Agent Chat
Ask questions about selected emails using the chat interface for contextual assistance.

---

## 🚀 Deployment on Vercel

### Backend Deployment

1. **Create Vercel Project**
   - Import your repository
   - Set **Root Directory**: `backend`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Output Directory**: `dist`
   - Set **Install Command**: `npm install`

2. **Environment Variables**
   ```
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   GEMINI_API_KEY=your-api-key
   GEMINI_MODEL=gemini-pro
   USE_MOCK_LLM=false
   ```

3. **Deploy**
   - Click Deploy
   - Note your backend URL (e.g., `https://your-backend.vercel.app`)

### Frontend Deployment

1. **Create Vercel Project**
   - Import the same repository
   - Set **Root Directory**: `frontend`
   - Set **Build Command**: `npm run build`
   - Set **Output Directory**: `dist`
   - Set **Install Command**: `npm install`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.vercel.app/api
   ```

3. **Deploy**
   - Click Deploy
   - Your app will be live at the Vercel URL

### Post-Deployment

- Verify backend: `https://your-backend.vercel.app/api/health`
- Check LLM status: `https://your-backend.vercel.app/api/llm/status`
- Update `FRONTEND_URL` in backend env vars to match your frontend URL exactly (no trailing slash)

---

## 📁 Project Structure

```
OceanAI/
├── backend/              # Express API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # LLM service (Gemini + mock)
│   │   ├── db/          # Database setup
│   │   └── data/        # Mock data & prompts
│   └── data/            # SQLite database (auto-created)
│
└── frontend/            # React application
    └── src/
        ├── components/  # React components
        ├── api.ts       # API client
        └── types.ts     # TypeScript types
```

---

## 🔧 Available Scripts

**Root:**
```bash
npm run dev:backend      # Start backend dev server
npm run dev:frontend     # Start frontend dev server
npm run install:all      # Install all dependencies
npm run build            # Build both services
```

**Backend:**
```bash
cd backend
npm run dev              # Dev server with hot reload
npm run build            # Compile TypeScript
npm start                # Production server
```

**Frontend:**
```bash
cd frontend
npm run dev              # Vite dev server
npm run build            # Production build
npm run preview          # Preview production build
```

---

## 🚀 Production Deployment (Vercel)

Both frontend and backend run on Vercel. These are the live URLs:

- Frontend: `https://prompt-driven-email-productivity-agent-c28g-h92tqnnr2.vercel.app`
- Backend (API): `https://prompt-driven-email-productivity-ag-sand.vercel.app`

### Backend (Vercel)
- **Root Directory**: `backend/`
- **Build Command**: `npm install && npm run build`
- **Output**: handled by Vercel serverless (`api/index.ts`)
- **Environment Variables**:
  - `FRONTEND_URL=https://prompt-driven-email-productivity-agent-c28g-h92tqnnr2.vercel.app`
  - `GEMINI_API_KEY=...`
  - `GEMINI_MODEL=gemini-2.0-flash` (or any available Gemini model)
  - `USE_MOCK_LLM=false`
- **Verification**: `GET /api/llm/status` returns provider/model (`gemini`, matches `GEMINI_MODEL`)

### Frontend (Vercel)
- **Root Directory**: `frontend/`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL=https://prompt-driven-email-productivity-ag-sand.vercel.app/api`

### Post-Deploy Checks
1. `GET /api/health` → `{ status: 'ok', ... }`
2. `GET /api/llm/status` → `llmProvider: "gemini"`, `model: "gemini-2.0-flash"`
3. Open frontend URL → inbox loads, actions hit backend successfully.

---

## 🔌 API Endpoints

**Base URL**: `http://localhost:3001/api` (dev) or `https://your-backend.vercel.app/api` (prod)

- `GET /emails` - Get all emails
- `GET /emails/:id` - Get single email
- `POST /emails/:id/categorize` - Categorize email
- `POST /emails/:id/actions` - Extract actions
- `POST /emails/:id/reply` - Generate reply draft
- `POST /emails/:id/summarize` - Summarize email
- `POST /emails/:id/priority` - Assess priority
- `GET /prompts` - Get all prompt templates
- `GET /drafts` - Get all drafts
- `POST /chat/:emailId?` - Send chat message
- `GET /api/health` - Health check
- `GET /api/llm/status` - LLM service status

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check port 3001 is available
- Ensure `backend/data/` directory exists (auto-created)

**CORS errors:**
- Verify `FRONTEND_URL` matches frontend URL exactly (no trailing slash)
- Check environment variables are set correctly

**LLM not working:**
- Verify `GEMINI_API_KEY` is set correctly
- Check API key has available quota
- Review backend logs for errors

**Database issues:**
- Delete `backend/data/email_agent.db` to reset
- Restart backend server

---

## 🔒 Security Notes

- **Drafts never auto-send** - All drafts require manual review
- Never commit `.env` files to version control
- Use environment variables for API keys in production
- Set `FRONTEND_URL` to exact domain in production (avoid wildcards)

---

## 📝 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Made with ❤️ for better email productivity**
