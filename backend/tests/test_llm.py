import pytest

from app.services.llm.gemini import GeminiLLMProvider

@pytest.mark.asyncio
async def test_gemini_llm(mocker):
    # Mock genai client
    mock_client = mocker.patch("app.services.llm.gemini.genai.Client")
    
    # Mock the nested models.generate_content response
    mock_response = mocker.MagicMock()
    mock_response.text = "A balance sheet is a financial statement that reports a company's assets, liabilities, and shareholder equity."
    
    mock_client.return_value.models.generate_content.return_value = mock_response

    llm = GeminiLLMProvider()
    answer = await llm.generate("In one sentence, explain what a balance sheet is.")

    assert answer == mock_response.text
    
    # Verify the mock was called
    mock_client.return_value.models.generate_content.assert_called_once()