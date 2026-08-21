from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.api.deps import get_db, get_current_user
from app.models.models import User, Resume, JobMatch, SavedJob, ActivityLog
from app.schemas.schemas import (
    JobAnalyzeRequest,
    JobMatchResponse,
    SavedJobCreate,
    SavedJobResponse
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/analyze", response_model=JobMatchResponse)
async def analyze_job_match(
    req: JobAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Fetch resume and verify ownership
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # 2. Call AI Service to calculate job match
    match_data = await AIService.calculate_job_match(resume.extracted_text, req.job_description)
    
    # 3. Save JobMatch model
    scores = match_data.get("scores", {})
    new_match = JobMatch(
        user_id=current_user.id,
        resume_id=resume.id,
        job_title=req.job_title or "Position Title",
        company=req.company or "Target Company",
        job_description=req.job_description,
        match_score=scores.get("overall", 0),
        skills_match=scores.get("skills", 0),
        experience_match=scores.get("experience", 0),
        education_match=scores.get("education", 0),
        keyword_match=scores.get("keywords", 0),
        responsibilities_match=scores.get("responsibilities", 0),
        analysis_json=match_data
    )
    db.add(new_match)
    
    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action="ANALYZE_JOB_MATCH",
        action_metadata={"resume_id": resume.id, "job_title": req.job_title}
    )
    db.add(log)
    
    db.commit()
    db.refresh(new_match)
    return new_match

@router.get("", response_model=List[JobMatchResponse])
def list_job_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    return db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.created_at.desc()).all()

@router.get("/{id}", response_model=JobMatchResponse)
def get_job_match(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    match = db.query(JobMatch).filter(JobMatch.id == id, JobMatch.user_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Job match record not found")
    return match

@router.delete("/{id}")
def delete_job_match(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    match = db.query(JobMatch).filter(JobMatch.id == id, JobMatch.user_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Job match record not found")
        
    db.delete(match)
    
    log = ActivityLog(
        user_id=current_user.id,
        action="DELETE_JOB_MATCH",
        action_metadata={"match_id": id}
    )
    db.add(log)
    
    db.commit()
    return {"success": True, "message": "Job match record deleted successfully"}

# Saved Jobs Endpoints
@router.post("/saved", response_model=SavedJobResponse)
def save_job(
    req: SavedJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    new_job = SavedJob(
        user_id=current_user.id,
        title=req.title,
        company=req.company,
        job_url=req.job_url,
        description=req.description
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("/saved", response_model=List[SavedJobResponse])
def list_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    return db.query(SavedJob).filter(SavedJob.user_id == current_user.id).order_by(SavedJob.created_at.desc()).all()

@router.get("/saved/{id}", response_model=SavedJobResponse)
def get_saved_job(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    job = db.query(SavedJob).filter(SavedJob.id == id, SavedJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Saved job not found")
    return job

@router.delete("/saved/{id}")
def delete_saved_job(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    job = db.query(SavedJob).filter(SavedJob.id == id, SavedJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Saved job not found")
        
    db.delete(job)
    db.commit()
    return {"success": True, "message": "Saved job deleted"}
