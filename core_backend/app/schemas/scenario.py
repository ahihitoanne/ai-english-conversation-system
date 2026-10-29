from typing import List, Optional
from pydantic import BaseModel

class VocabularySchema(BaseModel):
    id: Optional[int] = None
    word: str
    ipa: Optional[str] = None
    meaning_vi: str
    example_sentence: Optional[str] = None

    class Config:
        from_attributes = True

class ScenarioSchema(BaseModel):
    id: int
    title: str
    category: str
    user_role: str
    ai_role: str
    context_description: str
    initial_ai_message: str
    goals: List[str] = []
    vocabulary_items: List[VocabularySchema] = []

    class Config:
        from_attributes = True
