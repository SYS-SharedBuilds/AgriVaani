import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# The system should not block on missing keys; if missing, return a stub.
API_KEY = os.getenv("GEMINI_API_KEY", "")

if API_KEY and API_KEY != "mock_gemini_api_key":
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None

def generate_localized_rationale(ranked_crops: list, language: str) -> str:
    """
    Pass the ranked list + rationale through a Gemini prompt to generate the 
    final farmer-facing message in the farmer's preferred language.
    """
    prompt = f"""
    You are an expert agricultural advisor. Based on the following ranked crop recommendations, 
    write a friendly, encouraging 2-sentence summary for a farmer explaining the top choice.
    The response MUST be in the language code: {language}.
    
    Recommendations:
    {ranked_crops}
    """
    
    if model:
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            return _get_fallback_message(ranked_crops, language)
    else:
        # Return mocked response if API key is not real
        return _get_fallback_message(ranked_crops, language)

def _get_fallback_message(ranked_crops: list, language: str) -> str:
    top_crop = ranked_crops[0]['crop']
    if language == 'hi':
        return f"नमस्ते, आपके खेत के लिए {top_crop} सबसे अच्छा विकल्प है। {ranked_crops[0]['rationale']}"
    elif language == 'te':
        return f"నమస్కారం, మీ పొలానికి {top_crop} ఉత్తమ ఎంపిక. {ranked_crops[0]['rationale']}"
    else:
        return f"Hello, {top_crop} is the best choice for your field. {ranked_crops[0]['rationale']}"
