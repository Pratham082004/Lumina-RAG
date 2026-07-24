from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report


class ReportRepository:

    def __init__(self, db: Session):
        self.db = db

    # ---------------------------------------------------------
    # Existing Methods
    # ---------------------------------------------------------

    def get_by_id(self, report_id: int):
        return self.db.get(Report, report_id)

    def get_latest_report(self, company_id: int):
        stmt = (
            select(Report)
            .where(Report.company_id == company_id)
            .order_by(
                Report.fiscal_year.desc(),
                Report.report_date.desc(),
            )
        )

        return self.db.scalar(stmt)

    def list_company_reports(self, company_id: int):
        stmt = (
            select(Report)
            .where(Report.company_id == company_id)
            .order_by(Report.report_date.desc())
        )

        return list(self.db.scalars(stmt).all())

    def create(self, report: Report):
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    # ---------------------------------------------------------
    # New Methods
    # ---------------------------------------------------------

    def has_report(
        self,
        company_id: int,
        fiscal_year: int,
        filing_type: str = "10-K",
    ) -> bool:

        stmt = (
            select(Report)
            .where(
                Report.company_id == company_id,
                Report.fiscal_year == fiscal_year,
                Report.report_type == filing_type,
            )
            .limit(1)
        )

        return self.db.scalar(stmt) is not None

    def get_report(
        self,
        company_id: int,
        fiscal_year: int,
        filing_type: str = "10-K",
    ):

        stmt = (
            select(Report)
            .where(
                Report.company_id == company_id,
                Report.fiscal_year == fiscal_year,
                Report.report_type == filing_type,
            )
        )

        return self.db.scalar(stmt)

    def available_years(
        self,
        company_id: int,
        filing_type: str = "10-K",
    ) -> set[int]:

        stmt = (
            select(Report.fiscal_year)
            .where(
                Report.company_id == company_id,
                Report.report_type == filing_type,
            )
        )

        return {
            year
            for year in self.db.scalars(stmt).all()
        }

    def latest_year(
        self,
        company_id: int,
        filing_type: str = "10-K",
    ) -> int | None:

        stmt = (
            select(Report.fiscal_year)
            .where(
                Report.company_id == company_id,
                Report.report_type == filing_type,
            )
            .order_by(Report.fiscal_year.desc())
            .limit(1)
        )

        return self.db.scalar(stmt)

    def get_by_accession(
        self,
        accession_number: str,
    ):

        stmt = (
            select(Report)
            .where(
                Report.accession_number == accession_number
            )
        )

        return self.db.scalar(stmt)

    def exists_accession(
        self,
        accession_number: str,
    ) -> bool:

        return (
            self.get_by_accession(accession_number)
            is not None
        )

    def delete(
        self,
        report: Report,
    ):

        self.db.delete(report)
        self.db.commit()