from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class SessionHistory(Base):
    __tablename__ = "session_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id", ondelete="SET NULL"), nullable=True)
    duration_seconds = Column(Integer, default=0)
    turn_count = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0) # Percentage 0-100%
    feedback_summary = Column(Text, nullable=True)
    target_vocab_used = Column(JSON, nullable=True) # List of target words successfully used
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scenario = relationship("Scenario", back_populates="sessions")
    turns = relationship("TurnHistory", back_populates="session", cascade="all, delete-orphan")


class TurnHistory(Base):
    """
    Stores text-only transcript and AI evaluation per turn.
    Zero audio files stored - 100% compliant with privacy & zero storage cost.
    """
    __tablename__ = "turn_histories"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("session_histories.id", ondelete="CASCADE"), nullable=False)
    turn_index = Column(Integer, nullable=False)
    user_text = Column(Text, nullable=False)
    ai_reply = Column(Text, nullable=False)
    better_phrasing = Column(Text, nullable=True)     # Grammar / natural phrasing suggestion
    suggested_hints = Column(JSON, nullable=True)     # 2-3 quick response hints for the user
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    session = relationship("SessionHistory", back_populates="turns")
