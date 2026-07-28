# Financial RAG Backend

A Retrieval-Augmented Generation (RAG) backend application for analyzing SEC financial filings (10-K) using natural language queries. Automatically ingests, chunks, embeds, and indexes SEC EDGAR filings — then answers questions with cited sources.

## Tech Stack
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL + SQLAlchemy ORM
- **Vector Store:** ChromaDB (persistent, local)
- **Embeddings:** Google Gemini Embedding (`gemini-embedding-001`, 3072-dims)
- **LLM:** Google Gemini (`gemini-2.5-flash`)
- **Migrations:** Alembic
- **SEC Data:** EDGAR API (`data.sec.gov`)
- **HTML Parsing:** BeautifulSoup4 + lxml

## Setup
### Prerequisites
- Python 3.11+
- PostgreSQL (running)
- A Google Gemini API key

### Installation
1. Create a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables (copy `.env.example` to `.env` and fill in the values).
4. Run database migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the server:
   ```bash
   uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
   ```

## Development
- **Running Tests:**
  ```bash
  python -m pytest tests/ -v
  ```
- **Database Migrations:**
  ```bash
  # Create a new migration
  alembic revision --autogenerate -m "description"
  # Apply migrations
  alembic upgrade head
  ```
