📊 Financial RAG
<p align="center">
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![Gemini](https://img.shields.io/badge/Google-Gemini-orange)
![ChromaDB](https://img.shields.io/badge/Vector-ChromaDB-success)
![License](https://img.shields.io/badge/License-MIT-green)
</p>
A Retrieval-Augmented Generation (RAG) backend application for analyzing SEC financial filings (10-K) using natural language queries. Automatically ingests, chunks, embeds, and indexes SEC EDGAR filings — then answers questions with cited sources.
📚 Table of Contents
✨ Features
🛠️ Tech Stack
🏗️ Architecture
📂 Project Structure
🚀 Setup
⚙️ Configuration
📡 API Endpoints
📥 Ingestion Pipeline
🧠 RAG Pipeline
🧪 Development
📄 License
✨ Features
Feature	Description
SEC Filing Ingestion	Automatically download and parse 10-K filings from SEC EDGAR
Semantic Search	ChromaDB vector store with Google Gemini embeddings (3072-dim)
RAG-based Q&A	Ask questions in natural language, get answers grounded in filings
Auto-Company Resolution	Detects company from natural language (e.g., "Apple", "Microsoft", "GOOGL")
Auto-Ingestion on Chat	Missing filings are fetched automatically when you ask a question
Time-Aware Queries	Support for "past 2 years", "since 2021", "2023", "this year"
Section Extraction	Recognizes standard SEC sections: Business, Risk Factors, MD&A, Financials, etc.
Overlapping Chunks	1200-token chunks with 200-token overlap for better retrieval
Database-backed	PostgreSQL stores company metadata, report records, and chat history
🛠️ Tech Stack
Component	Technology
Framework	FastAPI (Python 3.11+)
Database	PostgreSQL + SQLAlchemy ORM
Vector Store	ChromaDB (persistent, local)
Embeddings	Google Gemini Embedding (`gemini-embedding-001`, 3072-dims)
LLM	Google Gemini (`gemini-2.5-flash`)
Migrations	Alembic
SEC Data	EDGAR API (`data.sec.gov`)
HTML Parsing	BeautifulSoup4 + lxml
🏗️ System Architecture
```
┌──────────────┐       ┌────────────────────────────────────────────────────┐
│   Client     │       │              FastAPI Application                   │
│  (HTTP)      │──────>│                                                    │
└──────────────┘       │  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
                       │  │  Health  │  │  Ingest  │  │     Chat       │    │
                       │  │  Routes  │  │  Routes  │  │    Routes      │    │
                       │  └──────────┘  └─────┬────┘  └────────┬───────┘    │
                       │                      │                │            │
                       │              ┌───────▼────────┐  ┌────▼────────┐   │
                       │              │  Ingestion     │  │  RAG        │   │
                       │              │  Pipeline      │  │  Service    │   │
                       │              │                │  │             │   │
                       │              │ ┌────────────┐ │  │ ┌─────────┐ │   │
                       │              │ │Company Look│ │  │ │Company  │ │   │
                       │              │ │Up (SEC API)│ │  │ │Resolver │ │   │
                       │              │ ├────────────┤ │  │ ├─────────┤ │   │
                       │              │ │Filing Look │ │  │ │Time     │ │   │
                       │              │ │Up (SEC API)│ │  │ │Parser   │ │   │
                       │              │ ├────────────┤ │  │ ├─────────┤ │   │
                       │              │ │Downloader  │ │  │ │Retrieval│ │   │
                       │              │ ├────────────┤ │  │ ├─────────┤ │   │
                       │              │ │Parser      │ │  │ │Prompt   │ │   │
                       │              │ ├────────────┤ │  │ │Builder  │ │   │
                       │              │ │Chunker     │ │  │ ├─────────┤ │   │
                       │              │ └────────────┘ │  │ │Gemini   │ │   │
                       │              └───────┬────────┘  │ │LLM      │ │   │
                       │                      │           └─────────────┘   │
                       │              ┌───────▼────────┐            │       │
                       │              │   Embeddings   │◄───────────┘       │
                       │              │  (Gemini API)  │                    │
                       │              └───────┬────────┘                    │
                       │              ┌───────▼────────┐                    │
                       │              │   ChromaDB    │                     │
                       │              │  Vector Store │                     │
                       │              └───────┬────────┘                    │
                       │                      │                             │
                       │              ┌───────▼────────┐                    │
                       │              │   PostgreSQL   │                    │
                       │              │  (Companies,   │                    │
                       │              │   Reports,     │                    │
                       │              │   Chunks,      │                    │
                       │              │   ChatHistory) │                    │
                       │              └────────────────┘                    │
                       └────────────────────────────────────────────────────┘
```
📂 Project Structure
<details>
<summary><b>Click to expand project structure</b></summary>
```text
backend/
├── alembic/                        # Database migrations
│   ├── env.py                      # Alembic environment config
│   ├── README
│   └── script.py.mako
├── alembic.ini                     # Alembic configuration
├── requirements.txt                # Python dependencies
├── TODO.md                         # Project task tracking
│
├── app/
│   ├── __init__.py
│   ├── app.py                      # FastAPI application factory + lifespan
│   ├── config.py                   # Pydantic Settings (env vars)
│   ├── dependencies.py             # Dependency injection wiring
│   │
│   ├── api/                        # HTTP API layer
│   │   ├── router.py               # Main API router (mounts sub-routers)
│   │   ├── health.py               # GET /health/
│   │   ├── ingest.py               # POST /ingest/
│   │   └── chats.py                # POST /chat/
│   │
│   ├── database/                   # Database connection
│   │   ├── base.py                 # SQLAlchemy DeclarativeBase
│   │   ├── database.py             # Engine creation
│   │   └── session.py              # SessionLocal + get_db()
│   │
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── company.py              # Company (ticker, cik, name)
│   │   ├── report.py               # Report (fiscal year, filing type)
│   │   ├── chunk.py                # Chunk (section, text)
│   │   └── chat.py                 # ChatHistory (query, response)
│   │
│   ├── schemas/                    # Pydantic models (API + internal)
│   │   ├── ingest.py               # IngestRequest / IngestResponse
│   │   ├── chats.py                # ChatRequest / ChatResponse / Source
│   │   ├── parsed_filing.py        # ParsedFiling / FilingSection / FilingChunk
│   │   └── section_extractor.py    # Section dataclass
│   │
│   ├── repositories/              # Data access layer
│   │   ├── company_repo.py         # CompanyRepository
│   │   └── report_repo.py          # ReportRepository
│   │
│   ├── ingestion/                  # SEC filing ingestion pipeline
│   │   ├── ingestion_manager.py    # Orchestrates multi-year ingestion
│   │   ├── pipeline.py             # Single-year ingestion pipeline
│   │   ├── company_lookup.py       # SEC company search (ticker → CIK)
│   │   ├── filing_lookup.py        # SEC filing search (CIK → filings)
│   │   ├── downloader.py           # Download + cache SEC HTML filings
│   │   ├── parser.py               # HTML → ParsedFiling conversion
│   │   ├── extractor.py            # Section extraction from text
│   │   ├── patterns.py             # SEC section regex patterns
│   │   ├── chunker.py              # Text → overlapping chunks
│   │   ├── models.py               # IngestionResult dataclass
│   │   └── exceptions.py           # Custom exceptions
│   │
│   ├── retrieval/                  # RAG retrieval + generation
│   │   ├── rag_service.py          # Full RAG pipeline orchestrator
│   │   ├── search.py               # RetrievalService (embed + query vector store)
│   │   ├── prompt_builder.py       # Builds LLM prompt from retrieved chunks
│   │   └── models.py               # SearchResult / RetrievalResult
│   │
│   ├── services/                   # Business logic services
│   │   ├── company_cache.py        # In-memory SEC company alias cache
│   │   ├── company_resolver.py     # Resolves company from question text
│   │   ├── company_service.py      # CRUD for companies
│   │   │
│   │   ├── embeddings/             # Embedding providers
│   │   │   ├── base.py             # Abstract EmbeddingProvider
│   │   │   ├── gemini.py           # Gemini embedding implementation
│   │   │   └── factory.py          # Provider factory
│   │   │
│   │   ├── llm/                    # LLM providers
│   │   │   ├── base.py             # Abstract LLMProvider
│   │   │   └── gemini.py           # Gemini LLM implementation
│   │   │
│   │   └── vector_store/           # Vector database providers
│   │       ├── base.py             # Abstract VectorStore
│   │       ├── chroma.py           # ChromaDB implementation
│   │       ├── factory.py          # VectorStore factory
│   │       └── models.py           # SearchResult / RetrievalResult
│   │
│   └── utils/
│       └── time_parser.py          # Parse time expressions from questions
│
├── storage/                        # Local file storage
│   ├── chroma/                     # ChromaDB persistent data
│   └── reports/                    # Downloaded SEC filings (by ticker/year/form)
│       ├── AAPL/2025/10-K/
│       ├── META/2025/10-K/
│       └── MSFT/2025/10-K/
│
└── tests/                          # Test suite
    ├── test_chunker.py
    ├── test_emb.py
    ├── test_filing_lookup.py
    ├── test_inges.py
    ├── test_llm.py
    ├── test_lookup.py
    ├── test_parser.py
    ├── test_qdrant.py
    ├── test_rag.py
    └── test_reti.py
```
</details>
🚀 Setup
📋 Prerequisites
Python 3.11+
PostgreSQL (running)
A Google Gemini API key
📦 Installation
Clone the repository
```bash
   git clone <repository-url>
   cd rag-fin
   ```
Create a virtual environment
```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
Install dependencies
```bash
   pip install -r backend/requirements.txt
   ```
Configure environment variables
Create a `.env` file in the project root with the following variables:
```env
   # Application
   APP_NAME="Financial RAG API"
   APP_VERSION="1.0.0"
   DEBUG=false

   # Server
   HOST=0.0.0.0
   PORT=8000

   # PostgreSQL
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=financial_rag
   DB_USER=postgres
   DB_PASSWORD=your_password

   # Redis (configured but currently unused)
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Storage
   REPORT_STORAGE=./storage/reports

   # Google Gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_EMBEDDING_MODEL=gemini-embedding-001
   GEMINI_MODEL=gemini-2.5-flash

   # Vector Store (ChromaDB)
   VECTOR_DB=chroma
   CHROMA_PATH=./storage/chroma
   CHROMA_COLLECTION=financial_rag
   VECTOR_SIZE=3072
   ```
Create the PostgreSQL database
```bash
   createdb financial_rag
   ```
Run database migrations
```bash
   cd backend
   alembic upgrade head
   ```
Start the server
```bash
   uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
   ```
The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.
⚙️ Configuration
Variable	Default	Description
`APP_NAME`	`Financial RAG API`	Application name
`APP_VERSION`	`1.0.0`	Application version
`DEBUG`	`false`	Enable debug logging
`HOST`	`0.0.0.0`	Server bind address
`PORT`	`8000`	Server port
`DB_HOST`	`localhost`	PostgreSQL host
`DB_PORT`	`5432`	PostgreSQL port
`DB_NAME`	`financial_rag`	PostgreSQL database name
`DB_USER`	`postgres`	PostgreSQL user
`DB_PASSWORD`	—	PostgreSQL password
`REDIS_HOST`	`localhost`	Redis host (reserved)
`REDIS_PORT`	`6379`	Redis port (reserved)
`REPORT_STORAGE`	`./storage/reports`	Path for downloaded filings
`GEMINI_API_KEY`	—	Google Gemini API key
`EMBEDDING_PROVIDER`	`gemini`	Embedding provider
`GEMINI_EMBEDDING_MODEL`	`gemini-embedding-001`	Embedding model
`GEMINI_MODEL`	`gemini-2.5-flash`	LLM model
`VECTOR_DB`	`chroma`	Vector database type
`CHROMA_PATH`	`./storage/chroma`	ChromaDB persistent path
`CHROMA_COLLECTION`	`financial_rag`	ChromaDB collection name
`VECTOR_SIZE`	`3072`	Embedding vector dimensions
📡 API Endpoints
`GET /`
Root endpoint — returns API information.
Response:
```json
{
  "message": "Financial RAG API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```
`GET /health/`
Health check endpoint.
Response:
```json
{
  "status": "ok"
}
```
`POST /ingest/`
Ingest an SEC filing for a given company.
Request Body:
```json
{
  "ticker": "AAPL",
  "filing_type": "10-K"
}
```
Response:
```json
{
  "company": "Apple Inc.",
  "ticker": "AAPL",
  "filing_type": "10-K",
  "sections": 8,
  "chunks": 42,
  "vectors": 42,
  "status": "SUCCESS"
}
```
`POST /chat/`
Ask a question about SEC filings. The system automatically:
Resolves the company from your question
Detects the time range ("past 2 years", "since 2021", etc.)
Auto-ingests any missing filings
Retrieves relevant chunks via semantic search
Generates an answer using Gemini with cited sources
Request Body:
```json
{
  "question": "What were Apple's revenue trends over the past 2 years?",
  "limit": 5
}
```
Response:
```json
{
  "company": "Apple Inc.",
  "ticker": "AAPL",
  "question": "What were Apple's revenue trends over the past 2 years?",
  "answer": "Based on Apple's 10-K filings...",
  "sources": [
    {
      "section": "mda",
      "filing_date": "2025-01-31",
      "year": 2025,
      "score": 0.92
    }
  ]
}
```
📥 Ingestion Pipeline
The ingestion pipeline processes SEC filings in a 7-step flow:
```
Company Lookup ──▶ Filing Lookup ──▶ Download ──▶ Parse ──▶ Chunk ──▶ Embed ──▶ Vector Store
                                                                                │
                                                                                ▼
                                                                           PostgreSQL
                                                                         (Report metadata)
```
Company Lookup — Searches SEC company tickers API by ticker symbol
Filing Lookup — Finds the latest/year-specific 10-K filing from EDGAR
Download — Downloads the HTML filing and caches it locally with metadata
Parse — Strips HTML, extracts clean text, identifies SEC sections
Chunk — Splits sections into overlapping 1200-token chunks (200 overlap)
Embed — Generates 3072-dim vectors via Gemini Embedding API
Store — Upserts vectors into ChromaDB + saves report metadata to PostgreSQL
🧠 RAG Pipeline
When a user asks a question:
```
Question ──▶ Company Resolver ──▶ Time Parser ──▶ Auto-Ingestion (if needed)
                                                       │
                                                       ▼
                                                Retrieval Service
                                                      │
                                             ┌───────┴───────┐
                                             ▼               ▼
                                       Embed Query     Filter by
                                       (Gemini)       ticker/year
                                             │               │
                                             └───────┬───────┘
                                                      ▼
                                                ChromaDB
                                             (semantic search)
                                                      │
                                                      ▼
                                                Prompt Builder
                                                      │
                                                      ▼
                                                Gemini LLM
                                                      │
                                                      ▼
                                                Answer + Sources
```
Sections Extracted
The system recognizes these standard SEC 10-K sections:
Section ID	Description
`business`	Item 1 — Business overview
`risk_factors`	Item 1A — Risk Factors
`cybersecurity`	Item 1C — Cybersecurity
`properties`	Item 2 — Properties
`legal`	Item 3 — Legal Proceedings
`mda`	Item 7 — Management's Discussion & Analysis
`market_risk`	Item 7A — Market Risk
`financials`	Item 8 — Financial Statements
`controls`	Item 9A — Controls & Procedures
`exhibits`	Item 15 — Exhibits
🧪 Development
✅ Running Tests
```bash
cd backend
python -m pytest tests/ -v
```
🗄️ Database Migrations
```bash
cd backend
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```
🚧 Project Status
See TODO.md for current development progress and known issues.
📄 License
Distributed under the MIT License.
---
⭐ If you found this project useful, consider giving it a star!
MIT