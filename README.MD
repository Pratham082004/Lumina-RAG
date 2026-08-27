# Lumina RAG

A full-stack **Retrieval-Augmented Generation (RAG)** application for analyzing SEC financial filings (10-K). Automatically ingests, chunks, embeds, and indexes SEC EDGAR filings, then answers natural language questions with cited sources — complete with interactive charts, live stock tickers, and exportable PDF reports.

The system consists of two services:
- **Backend** — FastAPI Python API (RAG pipeline, ingestion, retrieval, LLM integration, authentication, chat history)
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
- **AI Models**: Google Gemini LLM (`gemini-2.5-flash`) + Embeddings (`gemini-embedding-001`)
- **Authentication**: JWT + Google OAuth 2.0

### Frontend (`frontend/`)
- **Framework**: React 19 + TypeScript + Vite 8
- **UI & Charts**: Recharts, Framer Motion, TailwindCSS / Custom CSS
- **Markdown**: react-markdown + remark-gfm

---

## Setup Instructions

### Option A: Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd rag-fin
```
2. **Configure Environment Variables**
Ensure you provide your `GEMINI_API_KEY` and other sensitive variables (like Google OAuth credentials, SMTP credentials) via `.env` files or environment variables. Standard database and port configurations are handled automatically.

3. **Run with Docker Compose**
```bash
docker-compose up --build
```
This will spin up:
- **Frontend**: `http://localhost:80`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: port `5432`

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
- RAG with Gemini LLM and Gemini Embeddings
- ChromaDB vector store with metadata filtering
- Source citation in answers
- LLM-generated charts (bar, line, pie) via structured JSON output
- Live streaming AI responses token-by-token
- Custom document upload (drag-and-drop PDF/TXT) for ad-hoc RAG
- Export AI responses to downloadable PDF reports
- JWT authentication with refresh tokens + Google OAuth 2.0
- Email verification with 6-digit OTP
- Chat session history with persistent message storage
- Interactive stock ticker mentions (hover for real-time price + sparkline chart)
- Multi-company comparison queries
- Contact form integration with backend API handling and feedback alerts
- Dark/light theme toggle, Animated transitions, Glassmorphism UI

### 🔜 Planned
- Qdrant vector store support
- 10-Q (quarterly) filing support
- Real-time SEC feed monitoring
- Advanced analytics dashboard
- Password reset flow

---

## License

This project is licensed under the [MIT License](LICENSE).
