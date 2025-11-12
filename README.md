# PreCo - AI Presales Copilot

Transform client conversations into actionable project proposals with AI-powered intelligence.

## Overview

PreCo is an intelligent presales platform that bridges the gap between client requirements and technical implementation. It features dual portals for clients and engineers, enabling seamless collaboration throughout the presales process.

## Key Features

### Client Portal
- 💬 Natural language conversation with AI consultant
- 🎯 AI-powered technical recommendations
- 📄 Instant project proposal generation
- 💾 Proposal history and management
- ✅ Commit proposals to engineering team

### Engineer Dashboard
- 📊 Review committed client proposals
- 🔍 Intelligent resource recommendation system
- 📝 Custom technical planning with engineer notes
- 💼 Multi-plan version control
- 💬 Collaborative commenting system
- 📈 Cost and timeline estimation

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Markdown**: react-markdown with remark-gfm

### Backend
- **Framework**: FastAPI (Python)
- **AI**: OpenAI GPT-4o
- **Vector Store**: FAISS
- **Memory**: LangChain ConversationBufferMemory

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- OpenAI API Key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd yc
```

2. Set up backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create `.env` file in backend directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Set up frontend:
```bash
cd frontend
npm install
```

### Running the Application

Use the provided start script:
```bash
./start.sh
```

Or run services individually:

**Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
yc/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js 15 app directory
│   │   ├── client/       # Client portal page
│   │   ├── engineer/     # Engineer dashboard page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── chat-interface-demo.tsx
│   └── package.json
├── backend/              # FastAPI backend
│   ├── main.py          # Main API application
│   └── requirements.txt
├── start.sh             # Startup script
└── README.md
```

## Workflow

1. **Client Interaction**
   - Client describes project requirements through chat
   - AI consultant asks clarifying questions
   - System generates comprehensive proposal
   - Client reviews and commits proposal

2. **Engineering Planning**
   - Engineer reviews committed proposals
   - AI recommends relevant internal resources
   - Engineer adds custom notes and requirements
   - System generates detailed technical plan
   - Plan includes: tech stack, timeline, team, costs, risks

3. **Collaboration**
   - Multiple plan versions with history
   - Comments and discussions on each plan
   - Full audit trail of decisions

## API Endpoints

- `GET /` - Health check
- `POST /api/chat` - Chat with AI consultant
- `POST /api/generate-proposal` - Generate project proposal
- `GET /api/health` - System health status

## Storage

- Proposals and plans are stored in browser localStorage
- Session history maintained per client session
- Plan versions tracked with timestamps and comments

## Version

Current version: **1.0.0**

## License

Proprietary

---

Built with ❤️ using Next.js, FastAPI, and OpenAI GPT-4o
