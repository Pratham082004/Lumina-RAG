# Lumina Finance Application

A full-stack **Retrieval-Augmented Generation (RAG)** application for analyzing SEC financial filings (10-K). Automatically ingests, chunks, embeds, and indexes SEC EDGAR filings, then answers natural language questions with cited sources — complete with interactive charts and visualizations.

The system consists of three services:

- **Backend** — FastAPI Python API (RAG pipeline, ingestion, retrieval, LLM integration)
- **Frontend** — React 19 + TypeScript dashboard (charts, markdown, authentication UI)
- **Auth Service** — Express.js + Prisma authentication microservice (JWT, Google OAuth, email verification)

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│              React 19 + TypeScript + Vite                     │
│         Recharts · react-markdown · Framer Motion             │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTP (REST)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    Auth Service (Express)                      │
│              JWT · Google OAuth · Email Verification           │
│                        PostgreSQL (Prisma)                     │
└────────────────────────┬───────────────────────────────────────┘
                         │ HTTP (REST)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                           │
├────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐   ┌──────────────┐    ┌──────────────────┐  │
│  │  Ingestion    │   │  Retrieval   │    │   LLM + Embed    │  │
│  │  Pipeline     │─> │  Service     │<── │   (Gemini)       │  │
│  └──────┬────────┘   └──────┬───────┘    └──────────────────┘  │
│         │                  │                                   │
│         ▼                  ▼                                   │
│  ┌──────────────┐   ┌──────────────┐                           │
│  │  PostgreSQL  │   │   ChromaDB   │                           │
│  │  (Metadata)  │   │  (Vectors)   │                           │
│  └──────────────┘   └──────────────┘                           │
└────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend (`backend/`)
| Category              | Technology                                   |
|-----------------------|----------------------------------------------|
| Framework             | FastAPI (Python 3.11+)                       |
| Database (Relational) | PostgreSQL + SQLAlchemy ORM                  |
| Vector Store          | ChromaDB (persistent, local, cosine distance)|
| Embeddings            | Google Gemini Embedding (`gemini-embedding-001`, 3072-dims) |
| LLM                   | Google Gemini (`gemini-2.5-flash`)           |
| Migrations            | Alembic                                      |
| SEC Data Source       | EDGAR API (`data.sec.gov`)                   |
| HTML Parsing          | BeautifulSoup4 + lxml                        |
| Async HTTP            | httpx                                        |
| Testing               | pytest + pytest-asyncio                      |

### Frontend (`frontend/`)
| Category       | Technology                         |
|----------------|------------------------------------|
| Framework      | React 19 + TypeScript              |
| Build Tool     | Vite 8                             |
| Routing        | react-router-dom v7                |
| Charts         | Recharts                           |
| Markdown       | react-markdown + remark-gfm        |
| Animations     | Framer Motion                      |
| HTTP Client    | Axios                              |
| Auth (Google)  | @react-oauth/google                |
| Icons          | Lucide React                       |
| Linting        | Oxlint                             |

### Auth Service (`auth-service/`)
| Category        | Technology                         |
|-----------------|------------------------------------|
| Framework       | Express.js (TypeScript)            |
| ORM             | Prisma + PostgreSQL                |
| Authentication  | JWT (access + refresh tokens)      |
| OAuth           | Google OAuth 2.0 (google-auth-library) |
| Password Hashing| bcrypt                             |
| Email           | Nodemailer                         |
| Validation      | Zod                                |
| Security        | helmet, cors, cookie-parser        |

---

## Backend Architecture

### Ingestion Pipeline

The pipeline downloads and processes SEC 10-K filings end-to-end:

```
SEC EDGAR API
     │
     ▼
┌──────────────┐
│ Company      │  Look up CIK from ticker/name via SEC company_tickers.json
│ Lookup       │
└──────┬───────┘
       ▼
┌──────────────┐
│ Filing       │  Find the latest/specific filing for a given year and form type
│ Lookup       │
└──────┬───────┘
       ▼
┌──────────────┐
│ Downloader   │  Download raw HTML from SEC EDGAR; cache locally with metadata
└──────┬───────┘
       ▼
┌──────────────┐
│ Parser       │  Parse HTML with BeautifulSoup; extract sections (Business, Risk Factors, MD&A, etc.)
└──────┬───────┘
       ▼
┌──────────────┐
│ Chunker      │  Split sections into overlapping chunks (default: 1200 chars, 200 overlap)
└──────┬───────┘
       ▼
┌──────────────┐
│ Embeddings   │  Generate vector embeddings via Gemini Embedding API
│ (Gemini)     │
└──────┬───────┘
       ▼
┌──────────────┐
│ ChromaDB     │  Upsert vectors + metadata into persistent ChromaDB collection
└──────────────┘
       │
       ▼
┌──────────────┐
│ PostgreSQL   │  Save report metadata (company_id, year, accession_number, etc.)
│ (Metadata)   │
└──────────────┘
```

### Retrieval & QA Flow

```
User Question
     │
     ▼
┌──────────────────┐
│ Company Resolver │  Identify the company mentioned (name, alias, or ticker)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Time Parser      │  Extract year ranges from the question ("2023-2024")
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Ingestion        │  Auto-ingest missing years if not already indexed
│ Manager          │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ RetrievalService │  Embed question → search ChromaDB with metadata filters
│ (Vector Search)  │  (ticker, year, filing_type, section)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Prompt Builder   │  Build prompt with system instructions + retrieved chunks
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Gemini LLM       │  Generate answer with citations and optional charts
└──────┬───────────┘
       │
       ▼
     Answer + Sources
```

### API Endpoints

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| GET    | `/`                   | Root — API status and version                  |
| GET    | `/health`             | Health check                                   |
| POST   | `/ingest`             | Ingest the latest filing for a ticker          |
| POST   | `/ingest/upload`      | Upload a custom PDF/txt document for RAG       |
| POST   | `/chat`               | Ask a question about SEC filings               |

#### POST `/ingest`

```json
// Request
{ "ticker": "AAPL", "filing_type": "10-K" }

// Response
{
  "company": "Apple Inc.",
  "ticker": "AAPL",
  "filing_type": "10-K",
  "sections": 15,
  "chunks": 89,
  "vectors": 89,
  "status": "SUCCESS"
}
```

#### POST `/chat`

```json
// Request
{ "question": "What was Apple's revenue in 2024?", "limit": 5, "session_id": null }

// Response
{
  "company": "Apple Inc.",
  "ticker": "AAPL",
  "question": "What was Apple's revenue in 2024?",
  "answer": "According to Apple's 2024 10-K filing...",
  "sources": [
    { "section": "Item 8 — Financial Statements", "filing_date": "2024-10-31", "year": 2024, "score": 0.92 }
  ]
}
```

#### POST `/ingest/upload`

Upload a custom PDF or text document. The document is chunked, embedded, and vectorized under the given `session_id`. Subsequent `/chat` requests with the same `session_id` retrieve from both SEC filings and custom documents.

### Environment Variables (Backend)

| Variable               | Description                       | Default               |
|------------------------|-----------------------------------|-----------------------|
| `APP_NAME`             | Application name                  | —                     |
| `APP_VERSION`          | Application version               | —                     |
| `DEBUG`                | Debug mode                        | —                     |
| `HOST`                 | Server host                       | —                     |
| `PORT`                 | Server port                       | —                     |
| `DB_HOST`              | PostgreSQL host                   | —                     |
| `DB_PORT`              | PostgreSQL port                   | —                     |
| `DB_NAME`              | PostgreSQL database name          | —                     |
| `DB_USER`              | PostgreSQL user                   | —                     |
| `DB_PASSWORD`          | PostgreSQL password               | —                     |
| `REDIS_HOST`           | Redis host                        | —                     |
| `REDIS_PORT`           | Redis port                        | —                     |
| `REPORT_STORAGE`       | Local path for downloaded filings | —                     |
| `GEMINI_API_KEY`       | Google Gemini API key             | —                     |
| `GEMINI_EMBEDDING_MODEL`| Embedding model                  | `gemini-embedding-001`|
| `GEMINI_MODEL`         | LLM model                         | `gemini-2.5-flash`    |
| `VECTOR_DB`            | Vector database backend           | `chroma`              |
| `CHROMA_PATH`          | ChromaDB persistence path         | `./storage/chroma`    |
| `CHROMA_COLLECTION`    | ChromaDB collection name          | `financial_rag`       |
| `VECTOR_SIZE`          | Embedding vector dimension        | `3072`                |

---

## Frontend Features

- **Landing Page** — Hero section with app overview and call-to-action
- **Authentication** — Login, Register, Google OAuth via auth-service
- **Dashboard** — RAG-powered Q&A interface with markdown rendering and chart support
- **Onboarding** — User preference setup (job title, investment style, company)
- **Charts** — LLM-generated charts rendered as bar, line, or pie via Recharts (JSON-in-markdown format)
- **Responsive Design** — Mobile-friendly with Framer Motion animations

### Frontend Pages

| Route         | Component    | Description                    |
|---------------|--------------|--------------------------------|
| `/`           | Landing      | Hero section + app overview    |
| `/login`      | Login        | Email/password + Google OAuth  |
| `/register`   | Register     | User registration              |
| `/onboarding` | Onboarding   | User preferences setup         |
| `/dashboard`  | Dashboard    | RAG Q&A interface              |
| `/about`      | About        | About the project              |
| `/contact`    | Contact      | Contact form                   |
| `*`           | NotFound     | 404 page                       |

---

## Auth Service Features

- **JWT Authentication** — Access token (15 min) + Refresh token (7 days) with cookie storage
- **Google OAuth 2.0** — One-click login with Google
- **Email Verification** — Token-based email confirmation via Nodemailer
- **Password Reset** — Secure token-based password reset flow
- **User Management** — Profile update, session history
- **Chat History** — Persistent chat sessions with message and source storage
- **Rate Limiting** — Protection against brute-force attacks

---

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL (running)
- A Google Gemini API key
- (Optional) Google OAuth 2.0 client credentials for Google login

### 1. Clone & Environment

```bash
git clone <repository-url>
cd rag-fin
```

### 2. Backend Setup

```bash
# Create virtual environment
cd backend
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Copy .env.example to .env and fill in values
# At minimum, set:
#   GEMINI_API_KEY=your_gemini_api_key
#   DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/financial_rag

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
```

### 3. Auth Service Setup

```bash
cd auth-service

# Install dependencies
npm install

# Configure environment (.env)
#   DATABASE_URL=postgresql://user:pass@localhost:5432/auth_db
#   JWT_SECRET=your_jwt_secret
#   GOOGLE_CLIENT_ID=your_google_client_id
#   GOOGLE_CLIENT_SECRET=your_google_client_secret
#   SMTP_HOST=...
#   SMTP_USER=...
#   SMTP_PASS=...

# Run Prisma migrations
npx prisma migrate dev

# Start the auth service
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (.env)
#   VITE_API_URL=http://localhost:8000
#   VITE_AUTH_URL=http://localhost:4000
#   VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Start the dev server
npm run dev
```

---

## Project Structure

```
rag-fin/
├── README.MD                          # This file
├── .gitignore
├── backend/                           # FastAPI RAG Backend
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── alembic/                       # Database migrations
│   ├── app/
│   │   ├── app.py                     # FastAPI application entrypoint
│   │   ├── config.py                  # Settings & environment variables
│   │   ├── dependencies.py            # DI container (services, repos)
│   │   ├── api/                       # REST API routes
│   │   │   ├── router.py              # Main router aggregation
│   │   │   ├── health.py              # Health check endpoint
│   │   │   ├── ingest.py              # Ingestion endpoints
│   │   │   └── chats.py               # Chat / QA endpoint
│   │   ├── database/                  # PostgreSQL setup
│   │   │   ├── base.py                # SQLAlchemy declarative base
│   │   │   ├── database.py            # Engine creation
│   │   │   └── session.py             # Session local & dependency
│   │   ├── ingestion/                 # SEC ingestion pipeline
│   │   │   ├── pipeline.py            # End-to-end ingestion orchestrator
│   │   │   ├── ingestion_manager.py   # Multi-year ingestion orchestration
│   │   │   ├── company_lookup.py      # SEC company ticker search
│   │   │   ├── filing_lookup.py       # SEC EDGAR filing search
│   │   │   ├── downloader.py          # Filing download + caching
│   │   │   ├── parser.py              # HTML → structured text
│   │   │   ├── extractor.py           # Section extraction (Business, Risk, MD&A...)
│   │   │   ├── patterns.py            # SEC section header patterns
│   │   │   ├── chunker.py             # Text chunking with overlap
│   │   │   ├── models.py              # IngestionResult dataclass
│   │   │   └── exceptions.py          # Custom exceptions
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── company.py             # Company entity
│   │   │   ├── report.py              # Report (filing) entity
│   │   │   ├── chunk.py               # Chunk entity (optional DB tracking)
│   │   │   └── chat.py                # Chat history entity
│   │   ├── repositories/              # Data access layer
│   │   │   ├── company_repo.py        # Company CRUD
│   │   │   └── report_repo.py         # Report CRUD + queries
│   │   ├── retrieval/                 # RAG retrieval & generation
│   │   │   ├── search.py              # Vector search service
│   │   │   ├── rag_service.py         # RAG orchestrator (resolve → retrieve → prompt → LLM)
│   │   │   ├── prompt_builder.py      # LLM prompt construction
│   │   │   └── models.py              # SearchResult, RetrievalResult
│   │   ├── schemas/                   # Pydantic request/response models
│   │   │   ├── chats.py               # Chat request/response schemas
│   │   │   ├── ingest.py              # Ingest request/response schemas
│   │   │   ├── parsed_filing.py       # ParsedFiling, FilingSection, FilingChunk
│   │   │   └── section_extractor.py   # SectionExtraction schemas
│   │   ├── services/                  # External service integrations
│   │   │   ├── embeddings/            # Embedding providers (Gemini)
│   │   │   ├── llm/                   # LLM providers (Gemini)
│   │   │   ├── vector_store/          # Vector DB providers (ChromaDB)
│   │   │   ├── company_cache.py       # SEC company ticker cache
│   │   │   ├── company_resolver.py    # Natural language → company resolution
│   │   │   └── company_service.py     # Company business logic
│   │   └── utils/
│   │       └── time_parser.py         # Year/date extraction from questions
│   ├── storage/                       # Local storage
│   │   ├── chroma/                    # Persistent ChromaDB data
│   │   └── reports/                   # Downloaded SEC filings (HTML + metadata)
│   └── tests/                         # Test suite
│       ├── test_chunker.py
│       ├── test_emb.py
│       ├── test_filing_lookup.py
│       ├── test_inges.py
│       ├── test_llm.py
│       ├── test_lookup.py
│       ├── test_parser.py
│       ├── test_qdrant.py
│       ├── test_rag.py
│       └── test_reti.py
├── frontend/                          # React + TypeScript Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.tsx                   # Entry point
│       ├── App.tsx                    # Root component with routing
│       ├── App.css
│       ├── index.css                  # Global styles
│       ├── assets/                    # Static assets (images, icons)
│       ├── components/                # Shared components (Navbar)
│       ├── pages/                     # Route pages
│       │   ├── Landing.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Onboarding.tsx
│       │   ├── About.tsx
│       │   ├── Contact.tsx
│       │   └── NotFound.tsx
│       ├── styles/                    # Page-specific styles
│       └── utils/                     # Utility functions
└── auth-service/                      # Express.js Auth Microservice
    ├── package.json
    ├── prisma/
    │   └── schema.prisma              # User, Token, ChatSession, Message models
    └── src/
        ├── app.ts                     # Express app setup
        ├── server.ts                  # Server entrypoint
        ├── config/                    # Configuration
        ├── constants/                 # App constants
        ├── controllers/               # Route handlers
        │   ├── google.controller.ts
        │   ├── history.controller.ts
        │   ├── login.controller.ts
        │   ├── register.controller.ts
        │   └── user.controller.ts
        ├── database/                  # DB connection
        ├── emails/                    # Email templates
        ├── middlewares/               # Auth middleware, etc.
        ├── repositories/              # Data access
        ├── routes/
        │   └── auth.routes.ts         # Auth routes
        ├── schemas/                   # Zod validation schemas
        ├── services/                  # Business logic
        ├── types/                     # TypeScript types
        └── utils/
            └── jwt.ts                 # JWT token utilities
```

---

## Development

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_rag.py -v

# Frontend linting
cd frontend
npm run lint

# Auth service (no tests yet)
cd auth-service
npm test
```

### Database Migrations

```bash
# Backend (Alembic)
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head

# Auth Service (Prisma)
cd auth-service
npx prisma migrate dev --name description
npx prisma generate
```

### Vector Store Management

The backend uses **ChromaDB** (persistent, local) for vector storage. The database is stored at `backend/storage/chroma/`. ChromaDB uses cosine distance for similarity search with the following metadata filters available: `ticker`, `year`, `filing_type`, `section`, `accession_number`.

### SEC Data Source

All filings are sourced from the SEC EDGAR system:
- Company data: `https://www.sec.gov/files/company_tickers.json`
- Filing data: `https://data.sec.gov/submissions/CIK{cik}.json`
- Filing documents: `https://www.sec.gov/Archives/edgar/data/{cik}/{accession}/{document}`

The system includes proper User-Agent headers and respects SEC rate limits.

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
- JWT authentication with refresh tokens
- Google OAuth 2.0
- Email verification & password reset
- Chat session history

### 🔜 Planned
- Qdrant vector store support (foundation code exists)
- Multi-company comparison queries
- 10-Q (quarterly) filing support
- Real-time SEC feed monitoring
- Advanced analytics dashboard
- Interactive stock ticker mentions

---

## License

MIT

