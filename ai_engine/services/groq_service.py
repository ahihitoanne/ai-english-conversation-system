import io
import os
from pathlib import Path
from dotenv import load_dotenv
from groq import AsyncGroq

# Ensure ai_engine/.env is loaded when running standalone outside FastAPI
_AI_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if _AI_ENV_PATH.exists():
    load_dotenv(_AI_ENV_PATH, override=False)

_GROQ_PLACEHOLDER = "gsk_your_groq_api_key_here"

try:
    from app.core.config import settings
    DEFAULT_GROQ_KEY = getattr(settings, "GROQ_API_KEY", "")
    DEFAULT_TIMEOUT = float(getattr(settings, "AI_TIMEOUT_SECONDS", 10.0))
except Exception:
    DEFAULT_GROQ_KEY = os.getenv("GROQ_API_KEY", "")
    DEFAULT_TIMEOUT = float(os.getenv("AI_TIMEOUT_SECONDS", "10.0"))


class GroqService:
    """Speech-to-Text service backed by Groq Whisper."""

    def __init__(self, api_key: str = None, timeout_seconds: float = None):
        self.api_key = (api_key or DEFAULT_GROQ_KEY or os.getenv("GROQ_API_KEY", "")).strip()
        self.timeout_seconds = timeout_seconds or DEFAULT_TIMEOUT
        self.client = None
        if self.api_key and self.api_key != _GROQ_PLACEHOLDER:
            try:
                self.client = AsyncGroq(
                    api_key=self.api_key,
                    timeout=self.timeout_seconds,
                    max_retries=1,
                )
            except Exception as e:
                print(f"[GroqService] Initialization error: {e}")

    @property
    def is_configured(self) -> bool:
        """Return True when a non-placeholder Groq client is active."""
        return self.client is not None

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        """Transcribe speech audio bytes to English text via Groq Whisper."""
        if not self.client:
            # Fallback mock for early testing without API key
            return "Could I please order an iced latte with oat milk?"

        file_obj = io.BytesIO(audio_bytes)
        file_obj.name = filename

        transcription = await self.client.audio.transcriptions.create(
            file=file_obj,
            model="whisper-large-v3-turbo",
            language="en",
            temperature=0.0,
            response_format="text",
        )
        text = transcription if isinstance(transcription, str) else getattr(transcription, "text", str(transcription))
        return text.strip()


groq_service = GroqService()
