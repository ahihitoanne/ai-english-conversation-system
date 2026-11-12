import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scenario import Scenario
from app.models.session import SessionHistory, TurnHistory
from app.schemas.chat import ChatTurnResponse, StartSessionRequest, StartSessionResponse
from ai_engine.services.groq_service import groq_service
from ai_engine.services.gemini_service import gemini_service

router = APIRouter()


def _get_active_scenario_or_404(db: Session, scenario_id: int) -> Scenario:
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


def _get_session_or_404(db: Session, session_id: Optional[int]) -> Optional[SessionHistory]:
    if session_id is None:
        return None
    if session_id <= 0:
        raise HTTPException(status_code=400, detail="session_id must be a positive integer or omitted")
    session_row = db.query(SessionHistory).filter(SessionHistory.id == session_id).first()
    if not session_row:
        raise HTTPException(
            status_code=404,
            detail=f"Session {session_id} not found. Leave session_id empty or create one via POST /api/v1/chat/sessions.",
        )
    return session_row


@router.post("/sessions", response_model=StartSessionResponse)
def start_session(payload: StartSessionRequest, db: Session = Depends(get_db)):
    """Create a practice session row so turns can be saved in PostgreSQL."""
    _get_active_scenario_or_404(db, payload.scenario_id)
    session_row = SessionHistory(scenario_id=payload.scenario_id)
    db.add(session_row)
    db.commit()
    db.refresh(session_row)
    return StartSessionResponse(
        session_id=session_row.id,
        scenario_id=payload.scenario_id,
        created_at=session_row.created_at,
    )


def _load_recent_history(db: Session, session_id: Optional[int], ai_role: str) -> List[Dict[str, Any]]:
    if not session_id:
        return []
    turns = (
        db.query(TurnHistory)
        .filter(TurnHistory.session_id == session_id)
        .order_by(TurnHistory.turn_index.asc())
        .all()
    )
    return [{"user_text": t.user_text, "ai_reply": t.ai_reply, "ai_role": ai_role} for t in turns[-6:]]


async def _complete_turn(
    db: Session,
    scenario: Scenario,
    user_text: str,
    turn_index: int,
    session_row: Optional[SessionHistory],
    total_start: float,
    stt_ms: Optional[float] = None,
) -> ChatTurnResponse:
    session_id = session_row.id if session_row else None
    history = _load_recent_history(db, session_id, scenario.ai_role)

    llm_start = time.perf_counter()
    ai_data = await gemini_service.generate_turn_response(
        user_text=user_text,
        scenario_context=scenario.context_description,
        user_role=scenario.user_role,
        ai_role=scenario.ai_role,
        conversation_history=history,
    )
    llm_ms = round((time.perf_counter() - llm_start) * 1000, 2)

    if session_row is not None:
        turn = TurnHistory(
            session_id=session_row.id,
            turn_index=turn_index,
            user_text=user_text,
            ai_reply=ai_data.get("ai_reply", ""),
            better_phrasing=ai_data.get("better_phrasing"),
            suggested_hints=ai_data.get("suggested_hints", []),
        )
        session_row.turn_count = (session_row.turn_count or 0) + 1
        db.add(turn)
        db.commit()

    total_ms = round((time.perf_counter() - total_start) * 1000, 2)
    return ChatTurnResponse(
        user_text=user_text,
        ai_reply=ai_data.get("ai_reply", ""),
        better_phrasing=ai_data.get("better_phrasing"),
        suggested_hints=ai_data.get("suggested_hints", []),
        is_mock=ai_data.get("is_mock", False),
        model_used=ai_data.get("model_used"),
        stt_ms=stt_ms,
        llm_ms=llm_ms,
        total_ms=total_ms,
        error_detail=ai_data.get("error"),
    )


@router.post("/voice-turn", response_model=ChatTurnResponse)
async def process_voice_turn(
    audio: UploadFile = File(...),
    scenario_id: int = Form(...),
    turn_index: int = Form(1),
    session_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Core Voice AI Pipeline:
    1. Receive Audio from Browser Client
    2. Transcribe speech to text via Groq Whisper
    3. Generate dialogue, Better Phrasing & quick hints via Gemini 3-in-1 (google-genai)
    4. Save turn to PostgreSQL and return latency metrics
    """
    total_start = time.perf_counter()
    scenario = _get_active_scenario_or_404(db, scenario_id)
    session_row = _get_session_or_404(db, session_id)

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty")

    stt_start = time.perf_counter()
    try:
        user_text = await groq_service.transcribe_audio(audio_bytes, filename=audio.filename or "audio.webm")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq Whisper STT failed: {e}")
    stt_ms = round((time.perf_counter() - stt_start) * 1000, 2)

    if not user_text:
        raise HTTPException(status_code=422, detail="No speech recognized in audio")

    return await _complete_turn(
        db=db,
        scenario=scenario,
        user_text=user_text,
        turn_index=turn_index,
        session_row=session_row,
        total_start=total_start,
        stt_ms=stt_ms,
    )


@router.post("/text-turn", response_model=ChatTurnResponse)
async def process_text_turn(
    user_text: str = Form(...),
    scenario_id: int = Form(...),
    turn_index: int = Form(1),
    session_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    """Fallback text turn for typing when microphone is unavailable."""
    total_start = time.perf_counter()
    scenario = _get_active_scenario_or_404(db, scenario_id)
    session_row = _get_session_or_404(db, session_id)

    return await _complete_turn(
        db=db,
        scenario=scenario,
        user_text=user_text,
        turn_index=turn_index,
        session_row=session_row,
        total_start=total_start,
        stt_ms=None,
    )
