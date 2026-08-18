from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class InterviewStartRequest(BaseModel):
    resume_id: int
    job_description: str
    focus: str = "Mixed"

class InterviewStartResponse(BaseModel):
    question: str

class InterviewRespondRequest(BaseModel):
    resume_id: int
    job_description: str
    focus: str
    question: str
    response: str
    chat_history: str

class InterviewRespondResponse(BaseModel):
    score: int
    strengths: List[str]
    improvements: List[str]
    alternative_response: str
    next_question: str

class InterviewEndRequest(BaseModel):
    transcript: str

class InterviewEndResponse(BaseModel):
    overall_score: int
    technical_score: int
    communication_score: int
    performance_summary: str
    key_strengths: List[str]
    key_weaknesses: List[str]
