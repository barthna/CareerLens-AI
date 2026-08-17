from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Any
import io

from app.api.deps import get_db, get_current_user
from app.models.models import User, Resume, ResumeAnalysis, ActivityLog
from app.schemas.schemas import (
    ResumeResponse, 
    ResumeDetailResponse,
    ResumeAnalysisResponse,
    RenameResumeRequest
)
from app.services.resume_parser import ResumeParser
from app.services.file_storage import FileStorage
from app.services.ai_service import AIService

router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.post("/upload", response_model=ResumeDetailResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Validate file (type, size, empty)
    ResumeParser.validate_file(file)
    
    # 2. Read bytes and save to file storage
    file_bytes = file.file.read()
    file.file.seek(0)
    file_path = FileStorage.save_file(file_bytes, file.filename)
    
    # 3. Extract text
    extracted_text = ResumeParser.extract_text(file)
    
    # 4. Save Resume model to DB
    new_resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_type="pdf" if file.filename.lower().endswith(".pdf") else "docx",
        extracted_text=extracted_text
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    
    # 5. Run AI Analysis
    analysis_data = await AIService.analyze_resume(extracted_text)
    
    # 6. Save ResumeAnalysis model
    scores = analysis_data.get("scores", {})
    new_analysis = ResumeAnalysis(
        resume_id=new_resume.id,
        user_id=current_user.id,
        overall_score=scores.get("overall", 0),
        ats_score=scores.get("ats_compatibility", 0),
        skills_score=scores.get("skills", 0),
        experience_score=scores.get("experience", 0),
        formatting_score=scores.get("formatting", 0),
        keyword_score=scores.get("keywords", 0),
        analysis_json=analysis_data
    )
    db.add(new_analysis)
    
    # 7. Add Activity Log
    log = ActivityLog(
        user_id=current_user.id,
        action="UPLOAD_RESUME",
        action_metadata={"resume_id": new_resume.id, "filename": file.filename}
    )
    db.add(log)
    
    db.commit()
    db.refresh(new_resume)
    
    return new_resume

@router.get("", response_model=List[ResumeResponse])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()

@router.get("/{id}", response_model=ResumeDetailResponse)
def get_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.delete("/{id}")
def delete_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Delete from file storage
    FileStorage.delete_file(resume.file_path)
    
    # Delete from DB
    db.delete(resume)
    
    # Add Log
    log = ActivityLog(
        user_id=current_user.id,
        action="DELETE_RESUME",
        action_metadata={"resume_id": id, "filename": resume.filename}
    )
    db.add(log)
    
    db.commit()
    return {"success": True, "message": "Resume deleted successfully"}

@router.post("/{id}/analyze", response_model=ResumeDetailResponse)
async def reanalyze_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Re-run AI analysis
    analysis_data = await AIService.analyze_resume(resume.extracted_text)
    
    # Update or insert analysis
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).first()
    scores = analysis_data.get("scores", {})
    if not analysis:
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            user_id=current_user.id
        )
        db.add(analysis)
        
    analysis.overall_score = scores.get("overall", 0)
    analysis.ats_score = scores.get("ats_compatibility", 0)
    analysis.skills_score = scores.get("skills", 0)
    analysis.experience_score = scores.get("experience", 0)
    analysis.formatting_score = scores.get("formatting", 0)
    analysis.keyword_score = scores.get("keywords", 0)
    analysis.analysis_json = analysis_data
    
    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        action="REANALYZE_RESUME",
        action_metadata={"resume_id": resume.id}
    )
    db.add(log)
    
    db.commit()
    db.refresh(resume)
    return resume

@router.put("/{id}/rename", response_model=ResumeResponse)
def rename_resume(
    id: int,
    req: RenameResumeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    resume.filename = req.filename
    db.commit()
    db.refresh(resume)
    return resume

@router.get("/{id}/download")
def download_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    try:
        file_bytes = FileStorage.get_file(resume.file_path)
        media_type = "application/pdf" if resume.file_type == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={resume.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File could not be downloaded: {str(e)}")

@router.get("/{id}/improvements")
async def get_resume_improvements(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    improvements = await AIService.generate_resume_improvements(resume.extracted_text)
    return improvements
