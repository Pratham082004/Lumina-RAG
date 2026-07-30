from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from app.dependencies import get_pipeline
from app.ingestion.pipeline import IngestionPipeline
from app.schemas.ingest import (
    IngestRequest,
    IngestResponse,
)

router = APIRouter()


@router.post(
    "/",
    response_model=IngestResponse,
)
async def ingest_filing(
    request: IngestRequest,
    pipeline: IngestionPipeline = Depends(get_pipeline),
):

    try:

        result = await pipeline.ingest(
            ticker=request.ticker,
            filing_type=request.filing_type,
        )

        return IngestResponse(
            company=result.company,
            ticker=result.ticker,
            filing_type=result.filing_type,
            sections=result.sections,
            chunks=result.chunks,
            vectors=result.vectors,
            status=result.status,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )
@router.post('/upload')
async def upload_document(file: UploadFile = File(...), session_id: str = Form(...), pipeline: IngestionPipeline = Depends(get_pipeline)):
    from pypdf import PdfReader
    import io
    from app.ingestion.models import Chunk
    import uuid

    try:
        content = await file.read()
        text = ''
        if file.filename.endswith('.pdf'):
            reader = PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text += page.extract_text() + '\n'
        else:
            text = content.decode('utf-8')

        # Chunking (using simple length based chunking for now)
        # We can also use pipeline.chunker if it supports raw text, but let's do a simple one
        chunk_size = 1000
        overlap = 200
        raw_chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            raw_chunks.append(text[i:i + chunk_size])

        # Embeddings
        vectors = await pipeline.embedding_service.embed_batch(raw_chunks)

        payloads = []
        for i, chunk in enumerate(raw_chunks):
            payloads.append({
                'ticker': 'CUSTOM',
                'company': 'Custom Document',
                'company_id': 0,
                'cik': '0000',
                'year': 2025,
                'filing_type': 'CUSTOM',
                'filing_date': '2025-01-01',
                'accession_number': session_id,  # Use session_id here so we can filter by it
                'section': file.filename,
                'chunk_id': str(uuid.uuid4()),
                'token_count': len(chunk.split()),
                'text': chunk
            })

        await pipeline.vector_store.upsert(vectors=vectors, payloads=payloads)
        return {'success': True, 'message': 'Document uploaded successfully', 'chunks': len(raw_chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

