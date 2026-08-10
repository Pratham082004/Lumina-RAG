import asyncio

from app.services.embeddings import get_embedding_provider


async def main():

    provider = get_embedding_provider()

    vector = await provider.embed(
        "Apple reported record revenue."
    )

    print(f"Vector Dimension: {len(vector)}")
    print(vector[:10])


if __name__ == "__main__":
    asyncio.run(main())