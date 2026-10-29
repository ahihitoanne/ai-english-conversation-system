from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scenario import Scenario
from app.models.session import SessionHistory, TurnHistory
from app.schemas.chat import ChatTurnResponse
from app.services.groq_service import groq_service
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.post("/voice-turn", response_model=ChatTurnResponse)
async def process_voice_turn(
    audio: UploadFile = File(...),
    scenario_id: int = Form(...),
    turn_index: int = Form(1),
    session_id: int = Form(None),
    db: Session = Depends(get_db)
):
    """
    Core Voice AI Pipeline:
    1. Receive Audio from Browser Client VAD
    2. Transcribe speech to text via Groq Whisper (~0.2s)
    3. Generate dialogue, Better Phrasing & quick hints via Gemini 3-in-1
    4. Save turn to PostgreSQL
    """
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Step 1: Read audio bytes
    audio_bytes = await audio.read()
    
    # Step 2: STT with Groq Whisper
    try:
        user_text = await groq_service.transcribe_audio(audio_bytes, filename=audio.filename or "audio.webm")
    except Exception as e:
        print(f"STT Error: {e}")
        user_text = "I would like to order a drink."

    # Step 3: LLM 3-in-1 response with Gemini
    ai_data = await gemini_service.generate_turn_response(
        user_text=user_text,
        scenario_context=scenario.context_description,
        user_role=scenario.user_role,
        ai_role=scenario.ai_role
    )

    # Step 4: Persist Turn History if session_id is provided
    if session_id:
        turn = TurnHistory(
            session_id=session_id,
            turn_index=turn_index,
            user_text=user_text,
            ai_reply=ai_data.get("ai_reply", ""),
            better_phrasing=ai_data.get("better_phrasing"),
            suggested_hints=ai_data.get("suggested_hints", [])
        )
        db.add(turn)
        db.commit()

    return ChatTurnResponse(
        user_text=user_text,
        ai_reply=ai_data.get("ai_reply", ""),
        better_phrasing=ai_data.get("better_phrasing"),
        suggested_hints=ai_data.get("suggested_hints", []),
        is_mock=ai_data.get("is_mock", False)
    )

@router.post("/text-turn", response_model=ChatTurnResponse)
async def process_text_turn(
    user_text: str = Form(...),
    scenario_id: int = Form(...),
    turn_index: int = Form(1),
    session_id: int = Form(None),
    db: Session = Depends(get_db)
):
    """Fallback text turn for typing when microphone is unavailable"""
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    ai_data = await gemini_service.generate_turn_response(
        user_text=user_text,
        scenario_context=scenario.context_description,
        user_role=scenario.user_role,
        ai_role=scenario.ai_role
    )

    return ChatTurnResponse(
        user_text=user_text,
        ai_reply=ai_data.get("ai_reply", ""),
        better_phrasing=ai_data.get("better_phrasing"),
        suggested_hints=ai_data.get("suggested_hints", []),
        is_mock=ai_data.get("is_mock", False)
    )
