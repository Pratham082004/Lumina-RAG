from pathlib import Path

from app.ingestion.chunker import FilingChunker
from app.ingestion.parser import FilingParser


def main():

    parser = FilingParser()

    parsed = parser.parse(
        Path(
            "storage/reports/AAPL/2025/10-K/000032019325000079/filing.html"
        )
    )

    chunker = FilingChunker()

    chunks = chunker.chunk(parsed)

    print(f"Total Chunks: {len(chunks)}")

    for chunk in chunks[:5]:

        print("=" * 80)

        print(chunk.chunk_id)

        print(chunk.section)

        print(chunk.token_count)

        print(chunk.text[:300])


if __name__ == "__main__":
    main()