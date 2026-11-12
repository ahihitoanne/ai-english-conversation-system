import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

_AI_ROOT = Path(__file__).resolve().parent.parent
_AI_ENV_PATH = _AI_ROOT / ".env"
_PROMPT_PATH = _AI_ROOT / "prompts" / "chat_system.txt"

if _AI_ENV_PATH.exists():
    load_dotenv(_AI_ENV_PATH, override=False)

_GEMINI_PLACEHOLDER = "your_gemini_api_key_here"
_DEFAULT_PROMPT_TEMPLATE = """You are roleplaying as {ai_role} in an English speaking practice app called VocabTalk.
The user is roleplaying as {user_role}.
Context: {scenario_context}
{history_block}
User just said: "{user_text}"

Respond strictly in valid JSON with this exact structure:
{{
  "ai_reply": "Your in-character spoken response (1-2 sentences max, keep it friendly and end with an open question)",
  "better_phrasing": "If user's sentence had grammatical errors or awkward phrasing, provide a concise better phrasing like: 'Original -> Better phrasing'. If user spoke perfectly natural, return null",
  "suggested_hints": ["Short response hint 1", "Short response hint 2", "Short response hint 3"]
}}"""


def _read_setting(name: str, default: str = "") -> str:
    try:
        from app.core.config import settings
        val = getattr(settings, name, "")
        if val:
            return str(val).strip()
    except Exception:
        pass
    return os.getenv(name, default).strip()


class GeminiTurnSchema(BaseModel):
    """Structured JSON output contract expected from Gemini."""

    ai_reply: str
    better_phrasing: Optional[str] = None
    suggested_hints: List[str]


class GeminiService:
    """Roleplay dialogue, Better Phrasing, and reply-hint service using google-genai."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        fallback_models: Optional[List[str]] = None,
        timeout_seconds: Optional[float] = None,
    ):
        self.api_key = (api_key or _read_setting("GEMINI_API_KEY")).strip()
        self.model_name = (model_name or _read_setting("GEMINI_MODEL", "gemini-3.5-flash-lite")) or "gemini-3.5-flash-lite"
        self.timeout_seconds = float(timeout_seconds or _read_setting("AI_TIMEOUT_SECONDS", "10.0") or 10.0)

        if fallback_models is not None:
            self.fallback_models = [m.strip() for m in fallback_models if m.strip()]
        else:
            raw_fallbacks = _read_setting("GEMINI_FALLBACK_MODELS", "gemini-3.8-flash")
            self.fallback_models = [m.strip() for m in raw_fallbacks.split(",") if m.strip()]

        self.client: Optional[genai.Client] = None
        if self.api_key and self.api_key != _GEMINI_PLACEHOLDER:
            try:
                self.client = genai.Client(
                    api_key=self.api_key,
                    http_options=types.HttpOptions(
                        timeout=int(self.timeout_seconds * 1000),
                        retry_options=types.HttpRetryOptions(attempts=1),
                    ),
                )
            except Exception as e:
                print(f"[GeminiService] Initialization error: {e}")

    @property
    def is_configured(self) -> bool:
        """Return True when a non-placeholder Gemini client is active."""
        return self.client is not None

    def _candidate_models(self) -> List[str]:
        """Return ordered unique model names to try (primary first, then fallbacks)."""
        ordered = [self.model_name] + self.fallback_models
        return list(dict.fromkeys(m for m in ordered if m))

    def _format_history(self, conversation_history: Optional[List[Dict[str, Any]]]) -> str:
        if not conversation_history:
            return ""
        lines = []
        for turn in conversation_history[-6:]:
            user_line = turn.get("user_text") or ""
            ai_line = turn.get("ai_reply") or ""
            if user_line:
                lines.append(f"- User: {user_line}")
            if ai_line:
                lines.append(f"- {turn.get('ai_role', 'AI')}: {ai_line}")
        if not lines:
            return ""
        return "\nRecent conversation:\n" + "\n".join(lines) + "\n"

    def _build_prompt(
        self,
        user_text: str,
        scenario_context: str,
        user_role: str,
        ai_role: str,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        history_block = self._format_history(conversation_history)
        if _PROMPT_PATH.exists():
            base = _PROMPT_PATH.read_text(encoding="utf-8")
            prompt = (
                base.replace("{ai_role}", ai_role)
                .replace("{user_role}", user_role)
                .replace("{scenario_context}", scenario_context)
                .replace("{user_text}", user_text)
            )
            if history_block:
                prompt = prompt.replace(f'User just said: "{user_text}"', f'{history_block}User just said: "{user_text}"')
            return prompt

        return _DEFAULT_PROMPT_TEMPLATE.format(
            ai_role=ai_role,
            user_role=user_role,
            scenario_context=scenario_context,
            history_block=history_block,
            user_text=user_text,
        )

    @staticmethod
    def _parse_json_payload(raw_text: str) -> Dict[str, Any]:
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        parsed = json.loads(cleaned)
        hints = parsed.get("suggested_hints") or []
        if not isinstance(hints, list):
            hints = [str(hints)]
        return {
            "ai_reply": str(parsed.get("ai_reply") or "").strip(),
            "better_phrasing": parsed.get("better_phrasing"),
            "suggested_hints": [str(item) for item in hints[:3]],
        }

    async def generate_turn_response(
        self,
        user_text: str,
        scenario_context: str,
        user_role: str,
        ai_role: str,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Generate roleplay reply, Better Phrasing, and reply hints in one JSON call."""
        if not self.client:
            return {
                "ai_reply": "Certainly! Would you like that hot or iced, and what size would you prefer?",
                "better_phrasing": f"Your phrase: '{user_text}' -> More natural: 'Could I get an iced latte, please?'",
                "suggested_hints": [
                    "I'd like it iced, medium size please.",
                    "Hot with less sweet, thank you.",
                    "How much is a large one?",
                ],
                "is_mock": True,
                "model_used": "mock",
                "error": None,
            }

        prompt = self._build_prompt(
            user_text=user_text,
            scenario_context=scenario_context,
            user_role=user_role,
            ai_role=ai_role,
            conversation_history=conversation_history,
        )
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GeminiTurnSchema,
            temperature=0.7,
        )

        errors: List[str] = []
        for candidate_model in self._candidate_models():
            try:
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=candidate_model,
                        contents=prompt,
                        config=config,
                    ),
                    timeout=self.timeout_seconds + 1.0,
                )
                data = self._parse_json_payload(response.text or "")
                data["is_mock"] = False
                data["model_used"] = candidate_model
                data["error"] = None
                return data
            except Exception as e:
                err_msg = f"{candidate_model}: {e}"
                print(f"[GeminiService] Generation error ({err_msg})")
                errors.append(err_msg)

        return {
            "ai_reply": "I see! Could you tell me a little bit more about what you have in mind?",
            "better_phrasing": None,
            "suggested_hints": ["Yes, of course.", "Let me explain.", "Could you repeat that?"],
            "is_mock": True,
            "model_used": "mock-fallback",
            "error": "; ".join(errors),
        }


gemini_service = GeminiService()
