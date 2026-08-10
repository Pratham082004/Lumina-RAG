import asyncio

from app.services.vector_store.chroma import ChromaService


async def main():

    service = ChromaService()

    await service.create_collection()

    print("Chroma collection is ready.")


if __name__ == "__main__":
    asyncio.run(main())