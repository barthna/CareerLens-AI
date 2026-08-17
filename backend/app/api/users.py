from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.api.deps import get_db, get_current_user
from app.models.models import User, UserProfile, Skill, user_skills
from app.schemas.schemas import (
    UserResponse,
    UserProfileUpdate,
    UserProfileResponse,
    SkillResponse,
    UserSkillsUpdate
)

router = APIRouter(prefix="", tags=["users"])

@router.get("/profile", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_user)
) -> Any:
    return current_user

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    req: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        
    # Update fields
    if req.target_role is not None:
        profile.target_role = req.target_role
    if req.experience_years is not None:
        profile.experience_years = req.experience_years
    if req.location is not None:
        profile.location = req.location
    if req.preferred_industry is not None:
        profile.preferred_industry = req.preferred_industry
    if req.preferred_work_type is not None:
        profile.preferred_work_type = req.preferred_work_type
        
    db.commit()
    db.refresh(profile)
    return profile

# Skills Management
@router.get("/skills", response_model=List[SkillResponse])
def get_global_skills(
    db: Session = Depends(get_db)
) -> Any:
    # Initialize some typical skills if the table is empty
    count = db.query(Skill).count()
    if count == 0:
        default_skills = [
            ("React", "Frontend"), ("TypeScript", "Frontend"), ("Tailwind CSS", "Frontend"),
            ("Python", "Backend"), ("FastAPI", "Backend"), ("PostgreSQL", "Backend"),
            ("Docker", "DevOps"), ("AWS", "DevOps"), ("Git", "Tools"),
            ("Kubernetes", "DevOps"), ("Redis", "Backend"), ("Node.js", "Backend")
        ]
        for name, cat in default_skills:
            skill = Skill(name=name, category=cat)
            db.add(skill)
        db.commit()
        
    return db.query(Skill).order_by(Skill.name.asc()).all()

@router.get("/profile/skills", response_model=List[SkillResponse])
def get_user_skills(
    current_user: User = Depends(get_current_user)
) -> Any:
    return current_user.skills

@router.put("/profile/skills", response_model=List[SkillResponse])
def update_user_skills(
    req: UserSkillsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Clear existing user skills
    db.execute(
        user_skills.delete().where(user_skills.c.user_id == current_user.id)
    )
    
    # 2. Add or find skills, and associate
    skills_list = []
    for sk in req.skills:
        # Find skill in database or create it
        db_skill = db.query(Skill).filter(Skill.name == sk.name).first()
        if not db_skill:
            db_skill = Skill(name=sk.name, category="General")
            db.add(db_skill)
            db.commit()
            db.refresh(db_skill)
            
        # Associate with user
        statement = user_skills.insert().values(
            user_id=current_user.id,
            skill_id=db_skill.id,
            proficiency=sk.proficiency
        )
        db.execute(statement)
        skills_list.append(db_skill)
        
    db.commit()
    return skills_list
