from abc import ABC, abstractmethod
from typing import Any


class VectorStore(ABC):

    @abstractmethod
    async def create_collection(self) -> None:
        ...

    @abstractmethod
    async def upsert(
        self,
        vectors: list[list[float]],
        payloads: list[dict[str, Any]],
    ) -> None:
        ...

    @abstractmethod
    async def search(
        self,
        vector: list[float],
        where: dict[str, Any] | None = None,
        limit: int = 5,
    ):
        ...

    @abstractmethod
    async def delete(
        self,
        where: dict[str, Any],
    ) -> None:
        ...

    @abstractmethod
    async def exists(
        self,
        where: dict[str, Any],
    ) -> bool:
        ...

    @abstractmethod
    async def count(
        self,
        where: dict[str, Any] | None = None,
    ) -> int:
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        ...