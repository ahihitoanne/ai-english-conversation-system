from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Daily Life") # "Daily Life" or "Professional"
    user_role = Column(String(100), nullable=False)                     # e.g., "Customer"
    ai_role = Column(String(100), nullable=False)                       # e.g., "Barista"
    context_description = Column(Text, nullable=False)
    initial_ai_message = Column(Text, nullable=False)
    goals = Column(JSON, nullable=True)                                 # List of checklists/goals
    system_prompt = Column(Text, nullable=True)                         # Custom prompt instructions for AI
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vocabulary_items = relationship("Vocabulary", back_populates="scenario", cascade="all, delete-orphan")
    sessions = relationship("SessionHistory", back_populates="scenario")


class Vocabulary(Base):
    __tablename__ = "vocabulary"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False)
    word = Column(String(150), nullable=False)
    ipa = Column(String(150), nullable=True)
    meaning_vi = Column(String(255), nullable=False)
    example_sentence = Column(Text, nullable=True)

    # Relationship
    scenario = relationship("Scenario", back_populates="vocabulary_items")
