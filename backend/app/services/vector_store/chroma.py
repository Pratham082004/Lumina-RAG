from __future__ import annotations

import logging
from typing import Any

import chromadb
from chromadb.config import Settings

from app.config import settings
from app.services.vector_store.base import VectorStore

logger = logging.getLogger(__name__)


class ChromaService(VectorStore):

    def __init__(self) -> None:

        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PATH,
            settings=Settings(
                anonymized_telemetry=False,
            ),
        )

        self.collection_name = settings.CHROMA_COLLECTION
        self.collection = None

    # ---------------------------------------------------------
    # Collection
    # ---------------------------------------------------------

    async def create_collection(self) -> None:

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={
                "hnsw:space": "cosine",
            },
        )

        logger.info(
            "Chroma collection '%s' is ready.",
            self.collection_name,
        )

    def _ensure_collection(self) -> None:

        if self.collection is None:
            self.collection = self.client.get_collection(
                self.collection_name
            )

    # ---------------------------------------------------------
    # Upsert
    # ---------------------------------------------------------

    async def upsert(
        self,
        vectors: list[list[float]],
        payloads: list[dict[str, Any]],
    ) -> None:

        self._ensure_collection()

        if len(vectors) != len(payloads):
            raise ValueError(
                "Vectors and payloads must have the same length."
            )

        ids = []
        embeddings = []
        metadatas = []
        documents = []

        required = (
            "ticker",
            "year",
            "accession_number",
            "chunk_id",
        )

        for vector, payload in zip(vectors, payloads, strict=False):

            for field in required:
                if field not in payload:
                    raise ValueError(
                        f"Missing metadata field '{field}'"
                    )

            metadata = payload.copy()

            document = metadata.pop(
                "text",
                "",
            )

            vector_id = "_".join(
                [
                    str(metadata["ticker"]),
                    str(metadata["accession_number"]),
                    str(metadata["chunk_id"]),
                ]
            )

            ids.append(vector_id)
            embeddings.append(vector)
            documents.append(document)
            metadatas.append(metadata)

        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

        logger.info(
            "Upserted %d vectors.",
            len(ids),
        )

    # ---------------------------------------------------------
    # Search
    # ---------------------------------------------------------

    async def search(
        self,
        vector: list[float],
        where: dict[str, Any] | None =None,
        limit: int = 5,
    ):

        self._ensure_collection()

        return self.collection.query(
            query_embeddings=[vector],
            n_results=limit,
            where=where,
            include=[
                "documents",
                "metadatas",
                "distances",
            ],
        )

    # ---------------------------------------------------------
    # Exists
    # ---------------------------------------------------------

    async def exists(
        self,
        where: dict[str, Any],
    ) -> bool:

        self._ensure_collection()

        result = self.collection.get(
            where=where,
            limit=1,
        )

        return len(result["ids"]) > 0

    # ---------------------------------------------------------
    # Count
    # ---------------------------------------------------------

    async def count(
        self,
        where: dict[str, Any] | None = None,
    ) -> int:

        self._ensure_collection()

        if where is None:
            return self.collection.count()

        result = self.collection.get(
            where=where,
        )

        return len(result["ids"])

    # ---------------------------------------------------------
    # Delete
    # ---------------------------------------------------------

    async def delete(
        self,
        where: dict[str, Any],
    ) -> None:

        self._ensure_collection()

        self.collection.delete(
            where=where,
        )

        logger.info(
            "Deleted vectors matching %s",
            where,
        )

    # ---------------------------------------------------------
    # Health
    # ---------------------------------------------------------

    async def health_check(self) -> bool:

        try:
            self.client.heartbeat()
            return True

        except Exception:
            logger.exception(
                "Chroma health check failed."
            )
            return False

    # ---------------------------------------------------------
    # Cleanup
    # ---------------------------------------------------------

    async def close(self) -> None:
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(
        self,
        exc_type,
        exc_val,
        exc_tb,
    ):
        await self.close()