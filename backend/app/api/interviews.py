from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.api.deps import get_db, get_current_user
from app.models.models import User, Resume, ActivityLog
from app.schemas.interviews import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewRespondRequest,
    InterviewRespondResponse,
    InterviewEndRequest,
    InterviewEndResponse
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(
    req: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    question = await AIService.generate_interview_question(
        resume_text=resume.extracted_text,
        job_description=req.job_description,
        focus=req.focus,
        chat_history=""
    )
    
    # Log action
    log = ActivityLog(
        user_id=current_user.id,
        action="START_INTERVIEW",
        action_metadata={"resume_id": req.resume_id, "focus": req.focus}
    )
    db.add(log)
    db.commit()
    
    return {"question": question}

@router.post("/respond", response_model=InterviewRespondResponse)
async def respond_to_question(
    req: InterviewRespondRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Evaluate the current response
    feedback = await AIService.evaluate_interview_response(
        resume_text=resume.extracted_text,
        job_description=req.job_description,
        question=req.question,
        response=req.response
    )
    
    # Generate the next question
    updated_history = req.chat_history + f"\nQuestion: {req.question}\nAnswer: {req.response}"
    next_question = await AIService.generate_interview_question(
        resume_text=resume.extracted_text,
        job_description=req.job_description,
        focus=req.focus,
        chat_history=updated_history
    )
    
    return {
        "score": feedback.get("score", 0),
        "strengths": feedback.get("strengths", []),
        "improvements": feedback.get("improvements", []),
        "alternative_response": feedback.get("alternative_response", ""),
        "next_question": next_question
    }

@router.post("/end", response_model=InterviewEndResponse)
async def end_interview(
    req: InterviewEndRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    scorecard = await AIService.generate_interview_scorecard(transcript=req.transcript)
    
    # Log action
    log = ActivityLog(
        user_id=current_user.id,
        action="END_INTERVIEW",
        action_metadata={"overall_score": scorecard.get("overall_score", 0)}
    )
    db.add(log)
    db.commit()
    
    return scorecard
