# Lumina RAG

A full-stack **Retrieval-Augmented Generation (RAG)** application for analyzing SEC financial filings (10-K). Automatically ingests, chunks, embeds, and indexes SEC EDGAR filings, then answers natural language questions with cited sources — complete with interactive charts, live stock tickers, and exportable PDF reports.

The system consists of two services:
- **Backend** — FastAPI Python API (RAG pipeline, ingestion, retrieval, Ollama LLM integration, authentication, chat history)
- **Frontend** — React 19 + TypeScript dashboard (charts, markdown, authentication UI, settings)

---

## Documentation

To keep this file clean, detailed documentation has been split into the following files:

- [**Architecture**](ARCHITECTURE.md): System design, frontend/backend architecture, database models, and project structure.
- [**API Reference**](API_REFERENCE.md): API endpoints, request/response examples, and environment variable configuration.

---

## Tech Stack Summary

### Backend (`backend/`)
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL + SQLAlchemy ORM
- **Vector Store**: ChromaDB
- **AI Models**: Ollama Local LLM (`qwen2.5` / `llama3.1`) + Embeddings (`bge-m3`, 1024 dims)
- **Authentication**: JWT + Google OAuth 2.0

### Frontend (`frontend/`)
- **Framework**: React 19 + TypeScript + Vite 8
- **UI & Charts**: Recharts, Framer Motion, TailwindCSS / Custom CSS
- **Markdown**: react-markdown + remark-gfm

---

## 🦙 Ollama Setup Guide & Best Practices

Lumina RAG uses **Ollama** locally for privacy-focused, zero-cost AI embeddings and LLM generation.

### 1. Installation & Model Downloads
1. Download & install Ollama from [ollama.com](https://ollama.com).
2. Open terminal/PowerShell and pull the required models:
   ```bash
   # Pull the LLM generation model (qwen2.5)
   ollama pull qwen2.5

   # Pull the embedding model (bge-m3)
   ollama pull bge-m3
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```

---

### 🟢 What TO Do (Best Practices)

- ✅ **DO pull both models before starting**: Ensure `qwen2.5` and `bge-m3` are downloaded (`ollama list`) before making queries.
- ✅ **DO configure `OLLAMA_HOST` for Docker**: If running Docker on Windows/Linux, set `OLLAMA_HOST=0.0.0.0:11434` on your host OS so Docker containers can reach Ollama.
- ✅ **DO use `host.docker.internal` inside Docker**:
  - For local Python: `OLLAMA_BASE_URL=http://localhost:11434`
  - Inside Docker container: `OLLAMA_BASE_URL=http://host.docker.internal:11434`
- ✅ **DO verify Ollama status**: Check `http://localhost:11434` in your web browser to confirm Ollama is running.

---

### 🔴 What NOT To Do (Common Gotchas)

- ❌ **DON'T use `localhost:11434` inside Docker Compose**: Inside a Docker container, `localhost` points to the container itself (where Ollama isn't running). Always use `host.docker.internal:11434` inside Docker.
- ❌ **DON'T mix embedding dimensions**: If you switch embedding models (e.g. from 3072-dim models to 1024-dim `bge-m3`), ChromaDB will throw a dimension mismatch error. Lumina RAG auto-heals dimension changes, but resetting `./storage/chroma` is recommended if switching providers manually.
- ❌ **DON'T run Docker without starting Ollama**: The backend needs Ollama running on your host machine to generate embeddings and LLM responses.

---

## Setup Instructions

### Option A: Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/Pratham082004/Lumina-RAG.git
cd Lumina-RAG
```

2. **Configure Environment Variables**
Copy `.env.example` templates in `backend` and `frontend` to `.env`.

3. **Run with Docker Compose**
```bash
docker compose up --build
```
This will spin up:
- **Frontend**: `http://localhost:80`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: port `5432`

---

### Option B: Manual Local Setup

Please see [API_REFERENCE.md](API_REFERENCE.md) for required environment variables before setting up manually.

#### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Activate virtual env (Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate)
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
# Start the dev server
npm run dev
```

---

## Features

### ✅ Implemented
- SEC 10-K filing ingestion (download, parse, chunk, embed, index)
- Smart company resolution (name, alias, ticker)
- Time-aware queries ("What was Apple's revenue in 2024?")
- Automatic ingestion of missing years
- Local RAG pipeline with Ollama LLM (`qwen2.5`) and Ollama Embeddings (`bge-m3`)
- ChromaDB vector store with metadata filtering & auto-dimension healing
- Source citation in answers
- LLM-generated charts (bar, line, pie) via structured JSON output
- Live streaming AI responses token-by-token
- Custom document upload (drag-and-drop PDF/TXT) for ad-hoc RAG
- Export AI responses to downloadable PDF reports
- JWT authentication with refresh tokens + Google OAuth 2.0
- Email verification with 6-digit OTP & background email sending
- Chat session history with persistent message storage and context inference
- Interactive stock ticker mentions (hover for real-time price + sparkline chart)
- Multi-company comparison queries
- Contact form integration with backend API handling & email receipt
- Dark/light theme toggle, Animated transitions, Glassmorphism UI

---

## License

This project is licensed under the [MIT License](LICENSE).
