from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class SearchResult:
    """
    Represents a single retrieved chunk.
    """

    id: str

    text: str

    score: float

    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class RetrievalResult:
    """
    Represents the retrieval output for a query.
    """

    question: str

    results: list[SearchResult]