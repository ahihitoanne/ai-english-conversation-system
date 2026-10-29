from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scenario import Scenario, Vocabulary
from app.schemas.scenario import ScenarioSchema

router = APIRouter()

@router.get("", response_model=List[ScenarioSchema])
def get_all_scenarios(db: Session = Depends(get_db)):
    """Retrieve all active scenarios with their target vocabulary"""
    scenarios = db.query(Scenario).filter(Scenario.is_active == True).all()
    return scenarios

@router.get("/{scenario_id}", response_model=ScenarioSchema)
def get_scenario_by_id(scenario_id: int, db: Session = Depends(get_db)):
    """Retrieve a single scenario by ID"""
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id, Scenario.is_active == True).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario

def seed_default_scenarios(db: Session):
    """Seed initial 2 Scenarios defined in PROJECT_SPEC_VOCABTALK.md if DB is empty"""
    if db.query(Scenario).first():
        return # Already seeded

    # Scenario 1: Ordering Coffee
    s1 = Scenario(
        title="Ordering at a Coffee Shop",
        category="Daily Life",
        user_role="Customer",
        ai_role="Barista",
        context_description="You are ordering your favorite coffee drink, customizing sugar and size, and paying at the counter.",
        initial_ai_message="Hi there! Welcome to Green Bean Coffee. What can I get started for you today?",
        goals=[
            "Greet the barista and order a drink",
            "Specify size and temperature (iced or hot)",
            "Request customization (less sweet / oat milk)",
            "Ask for the price and ask for a receipt"
        ],
        is_active=True
    )
    db.add(s1)
    db.flush()

    vocab_s1 = [
        Vocabulary(scenario_id=s1.id, word="takeaway", ipa="/ˈteɪkəweɪ/", meaning_vi="mang đi", example_sentence="Can I get this takeaway, please?"),
        Vocabulary(scenario_id=s1.id, word="iced latte", ipa="/aɪst ˈlɑːteɪ/", meaning_vi="latte đá", example_sentence="I'd like a medium iced latte."),
        Vocabulary(scenario_id=s1.id, word="less sweet", ipa="/lɛs swiːt/", meaning_vi="ít ngọt", example_sentence="Could you make it less sweet?"),
        Vocabulary(scenario_id=s1.id, word="receipt", ipa="/rɪˈsiːt/", meaning_vi="hóa đơn", example_sentence="Can I have the receipt, please?")
    ]
    db.add_all(vocab_s1)

    # Scenario 2: IT Internship Interview
    s2 = Scenario(
        title="IT Internship Interview",
        category="Professional",
        user_role="Intern Candidate (3rd-year CS student)",
        ai_role="Technical Lead Interviewer",
        context_description="You are interviewing for a Software Engineering Internship at a tech startup.",
        initial_ai_message="Welcome! Thanks for taking the time to meet with us today. Could you briefly introduce yourself and your background?",
        goals=[
            "Introduce yourself and your programming stack",
            "Discuss a challenging project you built",
            "Explain how you handle team conflict and tight deadlines"
        ],
        is_active=True
    )
    db.add(s2)
    db.flush()

    vocab_s2 = [
        Vocabulary(scenario_id=s2.id, word="internship", ipa="/ˈɪntɜːrnʃɪp/", meaning_vi="kỳ thực tập", example_sentence="I am applying for the backend internship position."),
        Vocabulary(scenario_id=s2.id, word="teamwork", ipa="/ˈtiːmwɜːrk/", meaning_vi="làm việc nhóm", example_sentence="Teamwork was essential for delivering our project on time."),
        Vocabulary(scenario_id=s2.id, word="problem-solving", ipa="/ˈprɒbləm ˌsɒlvɪŋ/", meaning_vi="giải quyết vấn đề", example_sentence="I enjoy hands-on problem-solving in distributed systems."),
        Vocabulary(scenario_id=s2.id, word="deadline", ipa="/ˈdedlaɪn/", meaning_vi="hạn chót", example_sentence="We managed to meet the tight project deadline.")
    ]
    db.add_all(vocab_s2)
    db.commit()
    print("[Database] Seeded 2 default scenarios successfully into PostgreSQL!")
