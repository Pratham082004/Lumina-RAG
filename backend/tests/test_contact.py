import pytest
from httpx import ASGITransport, AsyncClient
from app.app import app


@pytest.mark.asyncio
async def test_contact_success(mocker):
    mock_cache = mocker.MagicMock()
    mock_cache.load = mocker.AsyncMock()
    mock_cache.company_records = []
    mocker.patch("app.app.get_company_cache", return_value=mock_cache)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/contact/",
            json={
                "email": "investor@example.com",
                "message": "Interested in enterprise API.",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "Thank you" in data["message"]


@pytest.mark.asyncio
async def test_contact_invalid_email(mocker):
    mock_cache = mocker.MagicMock()
    mock_cache.load = mocker.AsyncMock()
    mock_cache.company_records = []
    mocker.patch("app.app.get_company_cache", return_value=mock_cache)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/contact/",
            json={"email": "invalidemail", "message": "Hello"},
        )
        assert response.status_code == 400
        assert "valid email" in response.json()["detail"]


@pytest.mark.asyncio
async def test_contact_empty_message(mocker):
    mock_cache = mocker.MagicMock()
    mock_cache.load = mocker.AsyncMock()
    mock_cache.company_records = []
    mocker.patch("app.app.get_company_cache", return_value=mock_cache)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/contact/",
            json={"email": "test@example.com", "message": "   "},
        )
        assert response.status_code == 400
        assert "empty" in response.json()["detail"]
