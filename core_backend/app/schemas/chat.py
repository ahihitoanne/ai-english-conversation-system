from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class StartSessionRequest(BaseModel):
    scenario_id: int

class StartSessionResponse(BaseModel):
    session_id: int
    scenario_id: int
    created_at: datetime

class ChatTurnResponse(BaseModel):
    user_text: str
    ai_reply: str
    better_phrasing: Optional[str] = None
    suggested_hints: List[str] = []
    is_mock: bool = False
    model_used: Optional[str] = None
    stt_ms: Optional[float] = None
    llm_ms: Optional[float] = None
    total_ms: Optional[float] = None
    error_detail: Optional[str] = None

class EndSessionRequest(BaseModel):
    session_id: Optional[int] = None
    scenario_id: int
    duration_seconds: int
    turn_count: int
