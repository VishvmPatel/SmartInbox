# Prompt-Driven Email Productivity Agent

A full-stack email productivity application that uses LLM-driven processing to help manage and respond to emails efficiently. The application features a mock inbox, customizable prompt templates, AI-powered email analysis, and draft management.

## 🚀 Features

- **Mock Inbox**: 25 diverse sample emails covering various scenarios
- **Prompt Brain**: Create, edit, and manage prompt templates for LLM operations
- **LLM-Driven Processing**:
  - Email categorization (urgent, work, personal, etc.)
  - Action extraction from emails
  - Auto-reply draft generation
  - Email summarization
  - Priority assessment
- **Email Agent Chat**: Interactive chat interface with email context
- **Draft Management**: Save and edit email drafts (never sent automatically)
- **Modern UI**: Responsive design with dark mode support
- **Email Management**: Pin, archive, and organize emails

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type-safe development
- **SQLite** (better-sqlite3) - Database for persistence
- **OpenAI API** (with mock fallback) - LLM integration

### Frontend
- **React** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## 🔧 Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd OceanAI
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```
   
   This will install dependencies for:
   - Root package
   - Backend (`backend/`)
   - Frontend (`frontend/`)

3. **Set up environment variables** (optional):
   
   Create `backend/.env` file:
   ```env
   PORT=3001
   OPENAI_API_KEY=your-api-key-here
   ```
   
   > **Note**: The application works with a mock LLM service by default. To use OpenAI API, add your API key to the `.env` file.

## 🏃 Running the Application

### Development Mode

1. **Start the backend server** (Terminal 1):
   ```bash
   npm run dev:backend
   ```
   
   The backend will start on `http://localhost:3001`

2. **Start the frontend dev server** (Terminal 2):
   ```bash
   npm run dev:frontend
   ```
   
   The frontend will start on `http://localhost:3000`

3. **Open your browser**:
   ```
   http://localhost:3000
   ```

### Production Build

1. **Build both frontend and backend**:
   ```bash
   npm run build
   ```

2. **Start the backend**:
   ```bash
   cd backend
   npm start
   ```

3. **Serve the frontend** (using a static server):
   ```bash
   cd frontend
   npm run preview
   ```

## 📖 Demo Steps

### 1. Explore the Mock Inbox
- The inbox displays 25 sample emails
- Click on any email to view details
- Use the sidebar to navigate between sections

### 2. Test LLM Processing
Select an email and try these actions:

- **Categorize**: Click "Categorize" to classify the email
- **Extract Actions**: Click "Extract Actions" to see actionable items
- **Draft Reply**: Click "Draft Reply" to generate a context-aware response
- **Summarize**: Click "Summarize" to get a brief summary
- **Assess Priority**: Click "Assess Priority" to determine urgency

### 3. Manage Prompt Templates
- Navigate to the **Prompt Brain** section
- View default templates (Categorization, Action Extraction, etc.)
- Click on a template to edit it
- Create new templates with custom prompts
- Delete templates you don't need

### 4. Save and Edit Drafts
- After generating a reply draft, go to the **Drafts** section
- The draft is automatically loaded into the editor
- Edit the subject, recipient, or body
- Click "Save Draft" to store it
- Edit or delete saved drafts anytime

### 5. Use the Email Agent Chat
- Select an email
- Go to the **Email Agent** section
- Type questions about the email
- Use quick prompt chips for common actions
- The agent responds with email context

### 6. Organize Emails
- **Pin emails**: Click the pin icon to keep important emails at the top
- **Archive emails**: Click the archive icon to move emails out of the inbox
- **View archived**: Scroll down to see archived emails and restore them

## 📁 Project Structure

```
OceanAI/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   ├── mockInbox.ts          # 25 sample emails
│   │   │   └── defaultPrompts.ts     # Default prompt templates
│   │   ├── db/
│   │   │   └── database.ts            # Database setup
│   │   ├── routes/
│   │   │   ├── emails.ts             # Email endpoints
│   │   │   ├── prompts.ts            # Prompt template endpoints
│   │   │   ├── drafts.ts             # Draft endpoints
│   │   │   └── chat.ts               # Chat endpoints
│   │   ├── services/
│   │   │   └── llmService.ts         # LLM integration
│   │   └── index.ts                  # Express server
│   ├── data/
│   │   └── email_agent.db            # SQLite database (auto-created)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InboxList.tsx         # Email list
│   │   │   ├── EmailDetail.tsx       # Email details
│   │   │   ├── EmailActions.tsx     # LLM action buttons
│   │   │   ├── PromptBrain.tsx       # Prompt template manager
│   │   │   ├── DraftManager.tsx      # Draft manager
│   │   │   ├── ChatAgent.tsx         # Chat interface
│   │   │   └── SidebarNav.tsx        # Navigation
│   │   ├── api.ts                    # API client
│   │   ├── types.ts                  # TypeScript types
│   │   ├── App.tsx                   # Main app component
│   │   └── main.tsx                  # Entry point
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Emails
- `GET /api/emails` - List all emails
- `GET /api/emails/:id` - Get single email
- `PATCH /api/emails/:id/read` - Mark as read
- `POST /api/emails/:id/categorize` - Categorize email
- `POST /api/emails/:id/actions` - Extract actions
- `POST /api/emails/:id/reply` - Generate reply draft
- `POST /api/emails/:id/summarize` - Summarize email
- `POST /api/emails/:id/priority` - Assess priority

### Prompts
- `GET /api/prompts` - List all templates
- `GET /api/prompts/:id` - Get single template
- `POST /api/prompts` - Create template
- `PUT /api/prompts/:id` - Update template
- `DELETE /api/prompts/:id` - Delete template

### Drafts
- `GET /api/drafts` - List all drafts
- `GET /api/drafts/:id` - Get single draft
- `POST /api/drafts` - Create draft
- `PUT /api/drafts/:id` - Update draft
- `DELETE /api/drafts/:id` - Delete draft

### Chat
- `GET /api/chat/:emailId?` - Get chat messages
- `POST /api/chat/:emailId?` - Send message
- `DELETE /api/chat/:emailId?` - Clear chat

## 🎨 UI Features

- **Dark Mode**: Toggle dark/light theme (preference saved)
- **Responsive Design**: Works on desktop and mobile
- **Toast Notifications**: Feedback for user actions
- **Email Status**: Visual indicators for pinned/archived emails
- **Modern Design**: Card-based layouts with gradients

## 🔒 Security Notes

- **Drafts Never Sent**: The application never sends emails automatically
- **Mock Data**: All emails are mock data for demonstration
- **API Keys**: Store API keys in `.env` file (not committed)

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Ensure `backend/data/` directory exists
- Delete `backend/data/email_agent.db` to reset database

### Frontend won't start
- Check if port 3000 is available
- Ensure backend is running on port 3001
- Clear browser cache if UI doesn't update

### Database errors
- Delete `backend/data/email_agent.db` to reset
- Restart the backend server

## 📝 Default Prompt Templates

1. **Email Categorization** - Categorizes emails into predefined categories
2. **Action Extraction** - Extracts actionable items from emails
3. **Auto Reply Draft** - Generates context-aware reply drafts
4. **Email Summary** - Creates concise summaries
5. **Priority Assessment** - Assesses email priority levels

## 🤝 Contributing

This is a demonstration project. Feel free to fork and extend it!

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Deploy Options:**
- **Railway**: Deploy both backend and frontend in one project
- **Render**: Free tier available for both services
- **Vercel + Railway**: Vercel for frontend, Railway for backend

**Environment Variables Needed:**
- Backend: `PORT`, `FRONTEND_URL`, `OPENAI_API_KEY` (optional)
- Frontend: `VITE_API_URL`

## 📄 License

MIT License

---

**Note**: This application uses a mock LLM service by default. To use OpenAI API, add your API key to `backend/.env` file.
