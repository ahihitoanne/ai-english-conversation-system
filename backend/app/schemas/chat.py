from typing import List, Optional
from pydantic import BaseModel

class ChatTurnResponse(BaseModel):
    user_text: str
    ai_reply: str
    better_phrasing: Optional[str] = None
    suggested_hints: List[str] = []
    is_mock: bool = False

class EndSessionRequest(BaseModel):
    session_id: Optional[int] = None
    scenario_id: int
    duration_seconds: int
    turn_count: int
