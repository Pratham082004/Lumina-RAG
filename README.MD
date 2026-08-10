# Lumina Finance Application

A full-stack **Retrieval-Augmented Generation (RAG)** application for analyzing SEC financial filings (10-K). Automatically ingests, chunks, embeds, and indexes SEC EDGAR filings, then answers natural language questions with cited sources — complete with interactive charts, live stock tickers, and exportable PDF reports.

The system consists of two services:

- **Backend** — FastAPI Python API (RAG pipeline, ingestion, retrieval, LLM integration, authentication, chat history)
- **Frontend** — React 19 + TypeScript dashboard (charts, markdown, authentication UI, settings)

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
│                    Backend (FastAPI)                           │
├────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐   ┌──────────────┐    ┌──────────────────┐  │
│  │  Ingestion    │   │  Retrieval   │    │   LLM + Embed    │  │
│  │  Pipeline     │──>│  Service     │<── │   (Gemini)       │  │
│  └──────┬────────┘   └──────┬───────┘    └──────────────────┘  │
│         │                  │                                   │
│         ▼                  ▼                                   │
│  ┌──────────────┐   ┌──────────────┐                           │
│  │  PostgreSQL  │   │   ChromaDB   │                           │
│  │  (Metadata   │   │  (Vectors)   │                           │
│  │   + Auth)    │   │              │                           │
│  └──────────────┘   └──────────────┘                           │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Auth Module (JWT + Google OAuth + Email Verification)  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  History Module (Chat Sessions + Messages)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Stocks Module (Yahoo Finance real-time data)           │   │
│  └─────────────────────────────────────────────────────────┘   │
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
| Authentication        | JWT (access + refresh tokens) + Google OAuth 2.0 |
| Password Hashing      | bcrypt (passlib)                             |
| Email                 | SMTP via `smtplib` (OTP verification)        |
| SEC Data Source       | EDGAR API (`data.sec.gov`)                   |
| Stock Data            | Yahoo Finance API (via httpx)                |
| HTML Parsing          | BeautifulSoup4 + lxml                        |
| Async HTTP            | httpx                                        |
| Settings              | pydantic-settings                            |
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

#### Core RAG

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| GET    | `/`                   | Root — API status and version                  |
| GET    | `/health`             | Health check                                   |
| POST   | `/ingest`             | Ingest the latest filing for a ticker          |
| POST   | `/ingest/upload`      | Upload a custom PDF/txt document for RAG       |
| POST   | `/chat`               | Ask a question about SEC filings               |

#### Authentication

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| POST   | `/auth/register`      | Register a new user (sends OTP email)          |
| POST   | `/auth/login`         | Login with email/password (returns JWT)        |
| POST   | `/auth/verify`        | Verify email with 6-digit OTP                  |
| POST   | `/auth/resend-otp`    | Resend OTP to email                            |
| POST   | `/auth/google`        | Google OAuth login (verify Google token)        |

#### User & Profile

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| GET    | `/stats/{user_id}`    | Get user statistics (queries, docs analyzed)    |
| PUT    | `/profile/{user_id}`  | Update user profile (name, job, company, etc.) |

#### Chat History

| Method | Endpoint                               | Description                                    |
|--------|----------------------------------------|------------------------------------------------|
| GET    | `/history/{user_id}`                   | List all chat sessions for a user              |
| GET    | `/history/session/{session_id}`        | Get all messages in a session                  |
| POST   | `/history/{user_id}`                   | Create a new chat session                      |
| POST   | `/history/session/{session_id}/message`| Add a message to a session                     |
| DELETE | `/history/session/{session_id}`        | Delete a chat session                          |

#### Stock Data

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| GET    | `/stocks/{ticker}`    | Get real-time stock price + 1-month chart data |

---

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

| Variable                 | Description                        | Default                |
|--------------------------|------------------------------------|------------------------|
| `APP_NAME`               | Application name                   | —                      |
| `APP_VERSION`            | Application version                | —                      |
| `DEBUG`                  | Debug mode                         | —                      |
| `HOST`                   | Server host                        | —                      |
| `PORT`                   | Server port                        | —                      |
| `DB_HOST`                | PostgreSQL host                    | —                      |
| `DB_PORT`                | PostgreSQL port                    | —                      |
| `DB_NAME`                | PostgreSQL database name           | —                      |
| `DB_USER`                | PostgreSQL user                    | —                      |
| `DB_PASSWORD`            | PostgreSQL password                | —                      |
| `REDIS_HOST`             | Redis host                         | —                      |
| `REDIS_PORT`             | Redis port                         | —                      |
| `REPORT_STORAGE`         | Local path for downloaded filings  | —                      |
| `GEMINI_API_KEY`         | Google Gemini API key              | —                      |
| `GEMINI_EMBEDDING_MODEL` | Embedding model                    | `gemini-embedding-001` |
| `GEMINI_MODEL`           | LLM model                         | `gemini-2.5-flash`     |
| `VECTOR_DB`              | Vector database backend            | `chroma`               |
| `CHROMA_PATH`            | ChromaDB persistence path          | `./storage/chroma`     |
| `CHROMA_COLLECTION`      | ChromaDB collection name           | `financial_rag`        |
| `VECTOR_SIZE`            | Embedding vector dimension         | `3072`                 |
| `JWT_ACCESS_SECRET`      | JWT access token signing secret    | (default provided)     |
| `JWT_REFRESH_SECRET`     | JWT refresh token signing secret   | (default provided)     |
| `JWT_ACCESS_EXPIRES_MINUTES` | Access token TTL (minutes)     | `15`                   |
| `JWT_REFRESH_EXPIRES_DAYS`   | Refresh token TTL (days)       | `7`                    |
| `GOOGLE_CLIENT_ID`       | Google OAuth 2.0 client ID         | —                      |
| `FRONTEND_URL`           | Frontend URL for CORS/redirects    | `http://localhost:5173` |
| `EMAIL_HOST`             | SMTP host for sending emails       | `smtp.gmail.com`       |
| `EMAIL_PORT`             | SMTP port                          | `587`                  |
| `EMAIL_USER`             | SMTP username/email                | —                      |
| `EMAIL_PASS`             | SMTP password/app password         | —                      |

---

## Frontend Features

- **Landing Page** — Hero section with animated feature cards and call-to-action
- **Authentication** — Login, Register, Email Verification (OTP), Google OAuth
- **Dashboard** — RAG-powered Q&A interface with markdown rendering and chart support
- **Onboarding** — User preference setup (job title, investment style, company)
- **Settings** — Profile management, theme toggle (dark/light), notification preferences, integrations
- **Charts** — LLM-generated charts rendered as bar, line, or pie via Recharts (JSON-in-markdown format)
- **Stock Ticker Pills** — Interactive inline stock mentions with hover tooltips showing real-time price + mini sparkline chart
- **PDF Export** — Export AI responses to downloadable PDF reports
- **Animated Transitions** — Page transitions via Framer Motion `AnimatePresence` + animated background
- **Responsive Design** — Mobile-friendly with glassmorphism UI panels

### Frontend Pages

| Route         | Component    | Description                            |
|---------------|--------------|----------------------------------------|
| `/`           | Landing      | Hero section + feature cards           |
| `/login`      | Login        | Email/password + Google OAuth          |
| `/register`   | Register     | User registration + OTP email trigger  |
| `/verify`     | Verify       | 6-digit OTP email verification         |
| `/onboarding` | Onboarding   | User preferences setup                 |
| `/dashboard`  | Dashboard    | RAG Q&A interface + chat history       |
| `/settings`   | Settings     | Profile, theme, notifications, API keys|
| `/about`      | About        | About the project                      |
| `/contact`    | Contact      | Contact form                           |
| `*`           | NotFound     | 404 page                               |

### Frontend Components

| Component           | Description                                              |
|---------------------|----------------------------------------------------------|
| `Navbar`            | Navigation bar with auth-aware links                     |
| `AnimatedBackground`| Ambient animated background effect                       |
| `StockTickerPill`   | Inline stock ticker with hover tooltip + mini chart      |

---

## Auth & User Management

Authentication is handled directly by the backend (no separate auth service). The system supports:

- **JWT Authentication** — Access token (15 min) + Refresh token (7 days)
- **Google OAuth 2.0** — One-click login via Google ID token verification
- **Email Verification** — 6-digit OTP sent via SMTP, 15-minute expiry
- **User Profiles** — Name, job title, company, investment style, onboarding state
- **Chat History** — Persistent chat sessions with messages and source citations

### Database Models

| Model                    | Table                       | Description                          |
|--------------------------|-----------------------------|--------------------------------------|
| `User`                   | `users`                     | User account with profile fields     |
| `RefreshToken`           | `refresh_tokens`            | JWT refresh tokens per user          |
| `EmailVerificationToken` | `email_verification_tokens` | OTP tokens for email verification    |
| `PasswordResetToken`     | `password_reset_tokens`     | Tokens for password reset flow       |
| `ChatSession`            | `chat_sessions`             | Chat sessions per user               |
| `Message`                | `messages`                  | Individual messages within sessions  |
| `Company`                | `companies`                 | SEC company entities                 |
| `Report`                 | `reports`                   | Ingested SEC filing metadata         |
| `Chunk`                  | `chunks`                    | Document chunks (optional tracking)  |

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

---

### Option B: Manual Local Setup

#### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL (running)
- A Google Gemini API key
- (Optional) Google OAuth 2.0 client credentials for Google login
- (Optional) SMTP credentials for email verification

#### 1. Clone & Environment

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
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_NAME=financial_rag
#   DB_USER=your_db_user
#   DB_PASSWORD=your_db_password
#
# For authentication, also set:
#   JWT_ACCESS_SECRET=your_access_secret
#   JWT_REFRESH_SECRET=your_refresh_secret
#   GOOGLE_CLIENT_ID=your_google_client_id
#   EMAIL_USER=your_email@gmail.com
#   EMAIL_PASS=your_app_password

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (.env)
#   VITE_API_URL=http://localhost:8000
#   VITE_AUTH_URL=http://localhost:8000
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
├── docker-compose.yml                 # Docker Compose (backend + frontend + postgres)
├── backend/                           # FastAPI Backend (RAG + Auth + History)
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── alembic/                       # Database migrations
│   ├── app/
│   │   ├── app.py                     # FastAPI application entrypoint
│   │   ├── config.py                  # Settings & environment variables
│   │   ├── dependencies.py            # DI container (services, repos, auth)
│   │   ├── api/                       # REST API routes
│   │   │   ├── router.py              # Main router aggregation
│   │   │   ├── health.py              # Health check endpoint
│   │   │   ├── ingest.py              # Ingestion endpoints
│   │   │   ├── chats.py               # Chat / QA endpoint
│   │   │   ├── auth.py                # Auth endpoints (register, login, verify, Google)
│   │   │   ├── user.py                # User profile & stats endpoints
│   │   │   ├── history.py             # Chat history CRUD endpoints
│   │   │   └── stocks.py              # Real-time stock data (Yahoo Finance)
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
│   │   │   ├── user.py                # User, RefreshToken, EmailVerificationToken, PasswordResetToken
│   │   │   ├── chat_session.py        # ChatSession, Message
│   │   │   ├── company.py             # Company entity
│   │   │   ├── report.py              # Report (filing) entity
│   │   │   └── chunk.py               # Chunk entity (optional DB tracking)
│   │   ├── repositories/              # Data access layer
│   │   │   ├── company_repo.py        # Company CRUD
│   │   │   └── report_repo.py         # Report CRUD + queries
│   │   ├── retrieval/                 # RAG retrieval & generation
│   │   │   ├── search.py              # Vector search service
│   │   │   ├── rag_service.py         # RAG orchestrator (resolve → retrieve → prompt → LLM)
│   │   │   ├── prompt_builder.py      # LLM prompt construction
│   │   │   └── models.py              # SearchResult, RetrievalResult
│   │   ├── schemas/                   # Pydantic request/response models
│   │   │   ├── auth.py                # Auth schemas (UserCreate, UserLogin, Token, etc.)
│   │   │   ├── user.py                # User schemas (UserOut, UserProfileUpdate)
│   │   │   ├── chat_session.py        # ChatSession & Message schemas
│   │   │   ├── chats.py               # Chat request/response schemas
│   │   │   ├── ingest.py              # Ingest request/response schemas
│   │   │   ├── parsed_filing.py       # ParsedFiling, FilingSection, FilingChunk
│   │   │   └── section_extractor.py   # SectionExtraction schemas
│   │   ├── services/                  # External service integrations
│   │   │   ├── embeddings/            # Embedding providers (Gemini)
│   │   │   ├── llm/                   # LLM providers (Gemini)
│   │   │   ├── vector_store/          # Vector DB providers (ChromaDB)
│   │   │   ├── auth_service.py        # Password hashing, JWT creation/verification
│   │   │   ├── email_service.py       # SMTP email service (OTP sending)
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
│       ├── App.tsx                    # Root component with routing + AnimatePresence
│       ├── App.css
│       ├── index.css                  # Global styles & CSS variables
│       ├── assets/                    # Static assets (images, icons)
│       ├── components/                # Shared components
│       │   ├── Navbar.tsx             # Navigation bar
│       │   ├── AnimatedBackground.tsx # Ambient animated background
│       │   └── StockTickerPill.tsx    # Inline stock ticker with hover chart
│       ├── pages/                     # Route pages
│       │   ├── Landing.tsx            # Hero + feature cards
│       │   ├── Login.tsx              # Email/password + Google OAuth login
│       │   ├── Register.tsx           # User registration form
│       │   ├── Verify.tsx             # OTP email verification
│       │   ├── Dashboard.tsx          # RAG Q&A interface + chat history
│       │   ├── Onboarding.tsx         # User preferences wizard
│       │   ├── Settings.tsx           # Profile, theme, notifications, API keys
│       │   ├── About.tsx              # About page
│       │   ├── Contact.tsx            # Contact form
│       │   └── NotFound.tsx           # 404 page
│       ├── styles/                    # Page-specific styles
│       └── utils/                     # Utility functions
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
```

### Database Migrations

```bash
# Backend (Alembic)
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Vector Store Management

The backend uses **ChromaDB** (persistent, local) for vector storage. The database is stored at `backend/storage/chroma/`. ChromaDB uses cosine distance for similarity search with the following metadata filters available: `ticker`, `year`, `filing_type`, `section`, `accession_number`.

### SEC Data Source

All filings are sourced from the SEC EDGAR system:
- Company data: `https://www.sec.gov/files/company_tickers.json`
- Filing data: `https://data.sec.gov/submissions/CIK{cik}.json`
- Filing documents: `https://www.sec.gov/Archives/edgar/data/{cik}/{accession}/{document}`

The system includes proper User-Agent headers and respects SEC rate limits.

### Stock Data

Real-time stock data is fetched from the Yahoo Finance API. The `/stocks/{ticker}` endpoint returns:
- Current market price and previous close
- 1-month daily price history for sparkline charts
- Data is consumed by the `StockTickerPill` component for inline hover tooltips

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
- JWT authentication with refresh tokens (built into backend)
- Google OAuth 2.0 (server-side token verification)
- Email verification with 6-digit OTP
- User profile management (settings page)
- Chat session history with persistent message storage
- Interactive stock ticker mentions (hover for real-time price + sparkline chart)
- Multi-company comparison queries (comparative tables and multi-series charts)
- Dark/light theme toggle
- Animated page transitions (Framer Motion AnimatePresence)
- Glassmorphism UI with animated background

### 🔜 Planned
- Qdrant vector store support (foundation code exists)
- 10-Q (quarterly) filing support
- Real-time SEC feed monitoring
- Advanced analytics dashboard
- Password reset flow (model exists, UI pending)

---

## License

MIT
