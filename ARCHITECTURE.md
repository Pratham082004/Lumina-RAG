# Architecture

## Architecture Overview

```text
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

## Backend Architecture

### Ingestion Pipeline

The pipeline downloads and processes SEC 10-K filings end-to-end:

```text
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

```text
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

## Frontend Architecture

### Features

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

### Pages

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

### Components

| Component           | Description                                              |
|---------------------|----------------------------------------------------------|
| `Navbar`            | Navigation bar with auth-aware links                     |
| `AnimatedBackground`| Ambient animated background effect                       |
| `StockTickerPill`   | Inline stock ticker with hover tooltip + mini chart      |

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

## Project Structure

```text
rag-fin/
├── README.md
├── ARCHITECTURE.md
├── API_REFERENCE.md
├── LICENSE
├── .gitignore
├── docker-compose.yml
├── backend/                           # FastAPI Backend
│   ├── alembic/                       # Database migrations
│   ├── app/
│   │   ├── api/                       # REST API routes
│   │   ├── database/                  # PostgreSQL setup
│   │   ├── ingestion/                 # SEC ingestion pipeline
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   ├── repositories/              # Data access layer
│   │   ├── retrieval/                 # RAG retrieval & generation
│   │   ├── schemas/                   # Pydantic request/response models
│   │   └── services/                  # External service integrations
│   ├── storage/                       # Local storage (ChromaDB, reports)
│   └── tests/                         # Test suite
└── frontend/                          # React + TypeScript Frontend
    ├── public/
    └── src/
        ├── components/                # Shared components
        ├── pages/                     # Route pages
        ├── styles/                    # Page-specific styles
        └── utils/                     # Utility functions
```
