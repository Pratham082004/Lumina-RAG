from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from typing import List


CURRENT_YEAR = datetime.now().year


@dataclass(slots=True)
class TimeRange:
    """
    Represents the years required to answer a question.
    """

    years: List[int]


class TimeParser:
    """
    Extracts financial reporting years from a user's question.

    Examples
    --------
    "Apple's growth in the past 2 years"
        -> [2025, 2024]

    "Compare Apple since 2021"
        -> [2021, 2022, 2023, 2024, 2025]

    "Show Apple's 2023 annual report"
        -> [2023]

    "Business risks"
        -> [2025]
    """

    YEAR_PATTERN = re.compile(r"\b(20\d{2})\b")

    LAST_N_PATTERN = re.compile(
        r"(?:last|past|previous)\s+(\d+)\s+years?",
        re.IGNORECASE,
    )

    SINCE_PATTERN = re.compile(
        r"since\s+(20\d{2})",
        re.IGNORECASE,
    )

    LAST_YEAR_PATTERN = re.compile(
        r"last\s+year",
        re.IGNORECASE,
    )

    THIS_YEAR_PATTERN = re.compile(
        r"this\s+year",
        re.IGNORECASE,
    )

    def parse(self, question: str) -> TimeRange:
        question = question.lower()

        # ----------------------------------------------------
        # Explicit year
        # Example: "2023 report"
        # ----------------------------------------------------
        explicit = self.YEAR_PATTERN.findall(question)

        if explicit:
            years = sorted(
                {int(y) for y in explicit},
                reverse=True,
            )
            return TimeRange(years)

        # ----------------------------------------------------
        # Since 2021
        # ----------------------------------------------------
        match = self.SINCE_PATTERN.search(question)

        if match:
            start = int(match.group(1))

            years = list(
                range(start, CURRENT_YEAR + 1)
            )

            return TimeRange(years)

        # ----------------------------------------------------
        # Past N years
        # ----------------------------------------------------
        match = self.LAST_N_PATTERN.search(question)

        if match:
            n = int(match.group(1))

            years = [
                CURRENT_YEAR - i
                for i in range(n)
            ]

            return TimeRange(years)

        # ----------------------------------------------------
        # Last year
        # ----------------------------------------------------
        if self.LAST_YEAR_PATTERN.search(question):
            return TimeRange([CURRENT_YEAR - 1])

        # ----------------------------------------------------
        # This year
        # ----------------------------------------------------
        if self.THIS_YEAR_PATTERN.search(question):
            return TimeRange([CURRENT_YEAR])

        # ----------------------------------------------------
        # Default:
        # latest filing
        # ----------------------------------------------------
        return TimeRange([CURRENT_YEAR])