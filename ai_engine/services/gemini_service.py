import json
import google.generativeai as genai
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    generation_config={"response_mime_type": "application/json"}
                )
            except Exception as e:
                print(f"[GeminiService] Initialization error: {e}")

    async def generate_turn_response(
        self,
        user_text: str,
        scenario_context: str,
        user_role: str,
        ai_role: str,
        conversation_history: list = None
    ) -> dict:
        """
        Batching Prompt 3-in-1:
        Returns JSON with:
        - ai_reply: The conversational reply ending with an open question
        - better_phrasing: Suggested natural English correction if user made mistakes
        - suggested_hints: 2-3 quick response options for the user
        """
        if not self.model:
            # High-fidelity mock fallback if API key is not yet configured
            return {
                "ai_reply": "Certainly! Would you like that hot or iced, and what size would you prefer?",
                "better_phrasing": f"Your phrase: '{user_text}' -> More natural: 'Could I get an iced latte, please?'",
                "suggested_hints": [
                    "I'd like it iced, medium size please.",
                    "Hot with less sweet, thank you.",
                    "How much is a large one?"
                ],
                "is_mock": True
            }

        prompt = f"""
You are roleplaying as {ai_role} in an English speaking practice app called VocabTalk.
The user is roleplaying as {user_role}.
Context: {scenario_context}

User just said: "{user_text}"

Respond strictly in valid JSON with this exact structure:
{{
  "ai_reply": "Your in-character spoken response (1-2 sentences max, keep it friendly and end with an open question)",
  "better_phrasing": "If user's sentence had grammatical errors or awkward phrasing, provide a concise better phrasing like: 'Original -> Better phrasing'. If user spoke perfectly natural, return null",
  "suggested_hints": ["Short response hint 1", "Short response hint 2", "Short response hint 3"]
}}
"""
        try:
            response = self.model.generate_content(prompt)
            data = json.loads(response.text)
            data["is_mock"] = False
            return data
        except Exception as e:
            print(f"[GeminiService] Generation error: {e}")
            # Fallback on rate limit or error
            return {
                "ai_reply": "I see! Could you tell me a little bit more about what you have in mind?",
                "better_phrasing": None,
                "suggested_hints": ["Yes, of course.", "Let me explain.", "Could you repeat that?"],
                "is_mock": True
            }

gemini_service = GeminiService()
