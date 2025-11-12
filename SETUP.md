# AI Presales Copilot - Quick Start Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- OpenAI API Key

---

## 📦 Installation Steps

### 1️⃣ Configure Backend

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Mac/Linux
# or venv\Scripts\activate  # Windows

# Create .env file
cp .env.example .env

# Edit .env file, add your OpenAI API Key
# OPENAI_API_KEY=sk-...
```

### 2️⃣ Configure Frontend

```bash
cd frontend

# (Dependencies already installed)
```

---

## 🎯 Launch Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate
python main.py
```

Backend will run on: `http://localhost:8000`

### Start Frontend Server

Open a **new terminal window**:

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## 📱 Usage Instructions

### Client View (Main Page)
Visit: `http://localhost:3000`

1. **Start Conversation**: Describe your project requirements in the input box
2. **Multi-turn Interaction**: AI will ask questions and provide suggestions based on your needs
3. **Generate Proposal**: Click the "Generate Project Proposal" button to download the document when satisfied

### Engineer View
Visit: `http://localhost:3000/engineer`

View:
- **User Profile**: Industry, technical background, requirement analysis
- **Product Concept**: Feature modules, tech stack, implementation roadmap

---

## 🧪 Test Example Conversation

Try these examples:

```
🧑‍💼 You: I want to build an AI-driven drug solubility prediction app that works on mobile phones

🤖 AI: Great idea! We can build this based on the company's existing molecular embedding module...

🧑‍💼 You: Our research team has about 10 people with average technical background

🤖 AI: Understood. Considering the team background, I suggest...

🧑‍💼 You: Budget is around 500,000 RMB, hoping to launch MVP within 3 months

🤖 AI: Based on this budget and timeline, I recommend the following implementation plan...
```

---

## ⚙️ Current Feature Status

✅ **Implemented**:
- Multi-turn conversation (OpenAI GPT-4o)
- Intelligent requirement analysis
- Automatic project proposal generation
- Engineer-side view

🔄 **Planned** (Not yet implemented):
- RAG retrieval (vector database integration)
- Solution recommendations based on internal codebase
- Multi-language switching
- Session persistence

---

## 🔑 Important Notes

1. **API Key Security**:
   - ⚠️ Do not commit `.env` file to Git
   - ⚠️ `.env.example` is only a template

2. **Backend must start first**: Frontend depends on backend API

3. **Port Conflicts**:
   - If ports 8000 or 3000 are occupied, modify corresponding configuration

---

## 🐛 Common Issues

### Q: Frontend error "Failed to process request"
A: Check if backend is running normally (http://localhost:8000)

### Q: API call failed
A: Verify that `OPENAI_API_KEY` in `.env` is correct

### Q: Dependency installation failed
A: Ensure Python 3.11+ and Node.js 18+ versions

---

## 📚 Next Steps

1. **Add RAG functionality**: Integrate vector database and internal knowledge base
2. **Enhance UI**: Add typewriter effects, better styling
3. **Session Management**: Support multiple project sessions
4. **Deployment**: Configure Docker and cloud deployment

---

## 🎨 Project Structure

```
yc/
├── backend/           # FastAPI backend
│   ├── main.py       # Main application file
│   ├── requirements.txt
│   └── .env          # API key (needs to be created)
├── frontend/         # Next.js frontend
│   ├── app/
│   │   ├── page.tsx          # Client chat interface
│   │   ├── engineer/page.tsx # Engineer view
│   │   └── api/              # API routes
│   └── components/
│       └── chat-interface.tsx
└── README_AI_Presales_Copilot.md
```

---

**Enjoy using! 🚀**
