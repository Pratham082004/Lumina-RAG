from pathlib import Path

from app.ingestion.parser import FilingParser


def main():
    parser = FilingParser()

    html_path = Path(
        "storage/reports/AAPL/2025/10-K/000032019325000079/filing.html"
    )

    parsed = parser.parse(html_path)

    print("=" * 80)
    print("Title:")
    print(parsed.title)

    print("\nCompany:")
    print(parsed.company)

    print("\nTicker:")
    print(parsed.ticker)

    print("\nForm:")
    print(parsed.filing_type)

    print("\nFiling Date:")
    print(parsed.filing_date)

    print("\nNumber of Sections:")
    print(len(parsed.sections))

    print("\n" + "=" * 80)
    print("Sections Found")
    print("=" * 80)

    for i, section in enumerate(parsed.sections, start=1):
        print(f"\n{i}. {section.title}")
        print("-" * 60)
        print(section.content[:300])
        print()

    print("=" * 80)
    print("Raw Text Preview")
    print("=" * 80)

    print(parsed.raw_text[:3000])


if __name__ == "__main__":
    main()