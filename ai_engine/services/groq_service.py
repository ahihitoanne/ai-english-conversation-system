import os
import io
from groq import Groq

try:
    from app.core.config import settings
    DEFAULT_GROQ_KEY = getattr(settings, "GROQ_API_KEY", "")
except Exception:
    DEFAULT_GROQ_KEY = os.getenv("GROQ_API_KEY", "")

class GroqService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or DEFAULT_GROQ_KEY or os.getenv("GROQ_API_KEY", "")
        self.client = None
        if self.api_key and self.api_key != "gsk_your_groq_api_key_here":
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                print(f"[GroqService] Initialization error: {e}")

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        """
        Transcribes speech audio to English text using Groq Whisper LPU (~0.2s latency)
        """
        if not self.client:
            # Fallback mock for early testing without API key
            return "Could I please order an iced latte with oat milk?"

        try:
            # Prepare in-memory file for Groq client
            file_obj = io.BytesIO(audio_bytes)
            file_obj.name = filename

            transcription = self.client.audio.transcriptions.create(
                file=file_obj,
                model="whisper-large-v3-turbo",
                language="en",
                temperature=0.0,
                response_format="text"
            )
            return transcription.strip()
        except Exception as e:
            print(f"[GroqService] Transcription error: {e}")
            raise e

groq_service = GroqService()
