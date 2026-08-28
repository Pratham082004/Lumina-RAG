# API Reference

## API Endpoints

### Core RAG

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| GET    | `/`                   | Root — API status and version                  |
| GET    | `/health`             | Health check                                   |
| POST   | `/ingest`             | Ingest the latest filing for a ticker          |
| POST   | `/ingest/upload`      | Upload a custom PDF/txt document for RAG       |
| POST   | `/chat`               | Ask a question about SEC filings               |

### Authentication

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| POST   | `/auth/register`      | Register a new user (sends OTP email)          |
| POST   | `/auth/login`         | Login with email/password (returns JWT)        |
| POST   | `/auth/verify`        | Verify email with 6-digit OTP                  |
| POST   | `/auth/resend-otp`    | Resend OTP to email                            |
| POST   | `/auth/google`        | Google OAuth login (verify Google token)        |

### User & Profile

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| GET    | `/stats/{user_id}`    | Get user statistics (queries, docs analyzed)    |
| PUT    | `/profile/{user_id}`  | Update user profile (name, job, company, etc.) |

### Chat History

| Method | Endpoint                               | Description                                    |
|--------|----------------------------------------|------------------------------------------------|
| GET    | `/history/{user_id}`                   | List all chat sessions for a user              |
| GET    | `/history/session/{session_id}`        | Get all messages in a session                  |
| POST   | `/history/{user_id}`                   | Create a new chat session                      |
| POST   | `/history/session/{session_id}/message`| Add a message to a session                     |
| DELETE | `/history/session/{session_id}`        | Delete a chat session                          |

### Stock Data

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| GET    | `/stocks/{ticker}`    | Get real-time stock price + 1-month chart data |

### Contact & Support

| Method | Endpoint              | Description                                    |
|--------|-----------------------|------------------------------------------------|
| POST   | `/contact`            | Submit contact form message (email + content)  |

## Request & Response Examples

### POST `/ingest`

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

### POST `/chat`

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

### POST `/ingest/upload`

Upload a custom PDF or text document. The document is chunked, embedded, and vectorized under the given `session_id`. Subsequent `/chat` requests with the same `session_id` retrieve from both SEC filings and custom documents.

## Environment Variables (Backend)

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
| `EMBEDDING_PROVIDER`     | Embedding provider                 | `ollama`               |
| `LLM_PROVIDER`           | LLM provider                       | `ollama`               |
| `OLLAMA_BASE_URL`        | Ollama server base URL             | `http://localhost:11434`|
| `OLLAMA_EMBED_MODEL`     | Ollama embedding model name        | `bge-m3`               |
| `OLLAMA_LLM_MODEL`       | Ollama LLM model name              | `qwen2.5`              |
| `VECTOR_DB`              | Vector database backend            | `chroma`               |
| `CHROMA_PATH`            | ChromaDB persistence path          | `./storage/chroma`     |
| `CHROMA_COLLECTION`      | ChromaDB collection name           | `financial_rag`        |
| `VECTOR_SIZE`            | Embedding vector dimension         | `1024`                 |
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

## Data Sources

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
