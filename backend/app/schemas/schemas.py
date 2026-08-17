from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[float] = None
    type: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

# Profile Schemas
class UserProfileUpdate(BaseModel):
    target_role: Optional[str] = None
    experience_years: Optional[int] = 0
    location: Optional[str] = None
    preferred_industry: Optional[str] = None
    preferred_work_type: Optional[str] = None # Remote, Hybrid, On-site

class UserProfileResponse(BaseModel):
    target_role: Optional[str] = None
    experience_years: Optional[int] = 0
    location: Optional[str] = None
    preferred_industry: Optional[str] = None
    preferred_work_type: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    profile_image: Optional[str] = None
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True

# Skills Schemas
class SkillResponse(BaseModel):
    id: int
    name: str
    category: Optional[str] = None

    class Config:
        from_attributes = True

class SkillProficiency(BaseModel):
    name: str
    proficiency: str = "Intermediate"

class UserSkillsUpdate(BaseModel):
    skills: List[SkillProficiency]

# Resume Schemas
class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    overall_score: int
    ats_score: int
    skills_score: int
    experience_score: int
    formatting_score: int
    keyword_score: int
    analysis_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeDetailResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    extracted_text: Optional[str] = None
    created_at: datetime
    analysis: Optional[ResumeAnalysisResponse] = None

    class Config:
        from_attributes = True

class RenameResumeRequest(BaseModel):
    filename: str

# Job Schemas
class JobAnalyzeRequest(BaseModel):
    resume_id: int
    job_title: Optional[str] = None
    company: Optional[str] = None
    job_description: str

class JobMatchResponse(BaseModel):
    id: int
    resume_id: int
    job_title: Optional[str] = None
    company: Optional[str] = None
    job_description: Optional[str] = None
    match_score: int
    skills_match: int
    experience_match: int
    education_match: int
    keyword_match: int
    responsibilities_match: int
    analysis_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class SavedJobCreate(BaseModel):
    title: str
    company: str
    job_url: Optional[str] = None
    description: Optional[str] = None

class SavedJobResponse(BaseModel):
    id: int
    title: str
    company: str
    job_url: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardSummaryResponse(BaseModel):
    resume_score: int
    ats_score: int
    job_matches: int
    missing_skills: int
    profile_strength: int

class ScoreHistoryItem(BaseModel):
    date: str
    score: int

class MatchDistribution(BaseModel):
    excellent: int
    good: int
    moderate: int
    low: int

class SkillOverviewItem(BaseModel):
    skill: str
    level: int  # 0 to 100

class ActivityItem(BaseModel):
    day: str
    count: int

class DashboardAnalyticsResponse(BaseModel):
    resume_score_history: List[ScoreHistoryItem]
    job_match_distribution: MatchDistribution
    skills_overview: List[SkillOverviewItem]
    weekly_activity: List[ActivityItem]

# Admin Schemas
class AdminStatsResponse(BaseModel):
    total_users: int
    total_resumes: int
    total_job_matches: int
    total_ai_analyses: int
    daily_active_users: int
