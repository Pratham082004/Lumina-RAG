from pathlib import Path
import json
import logging

# pyrefly: ignore [missing-import]
from bs4 import BeautifulSoup
from bs4.builder import XMLParsedAsHTMLWarning
import warnings 

warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

# pyrefly: ignore [missing-import]
from app.ingestion.extractor import SectionExtractor
from app.schemas.parsed_filing import ParsedFiling

logger = logging.getLogger(__name__)


class FilingParser:
    """
    Converts a downloaded SEC filing HTML into a structured ParsedFiling object.
    """

    def __init__(self) -> None:
        self.section_extractor = SectionExtractor()

    def parse(
        self,
        html_path: Path,
    ) -> ParsedFiling:
        """
        Parse a downloaded SEC filing.

        Parameters
        ----------
        html_path : Path
            Path to the downloaded filing.html.

        Returns
        -------
        ParsedFiling
            Parsed filing containing metadata, raw text, and extracted sections.
        """

        if not html_path.exists():
            raise FileNotFoundError(
                f"HTML filing not found: {html_path}"
            )

        metadata_path = html_path.parent / "metadata.json"

        if not metadata_path.exists():
            raise FileNotFoundError(
                f"Metadata file not found: {metadata_path}"
            )

        logger.info("Parsing filing: %s", html_path)

        metadata = json.loads(
            metadata_path.read_text(
                encoding="utf-8",
            )
        )

        html = html_path.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        soup = BeautifulSoup(
            html,
            "lxml",
        )

        # Remove unnecessary HTML elements
        for tag in soup.select(
            "script, style, noscript, svg, img"
        ):
            tag.decompose()

        text = soup.get_text(separator="\n")

        clean_lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        clean_text = "\n".join(clean_lines)

        sections = self.section_extractor.extract(
            clean_text
        )

        logger.info(
            "Successfully parsed %s (%s) with %d extracted sections.",
            metadata["company"],
            metadata["ticker"],
            len(sections),
        )

        return ParsedFiling(
            company=metadata["company"],
            ticker=metadata["ticker"],
            filing_type=metadata["form"],
            filing_date=metadata["filing_date"],
            title=f'{metadata["company"]} {metadata["form"]}',
            raw_text=clean_text,
            sections=sections,
        )