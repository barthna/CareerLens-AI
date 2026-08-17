from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any
import datetime

from app.api.deps import get_db, get_current_user
from app.models.models import User, Resume, ResumeAnalysis, JobMatch, SavedJob, ActivityLog
from app.schemas.schemas import (
    DashboardSummaryResponse,
    DashboardAnalyticsResponse,
    ScoreHistoryItem,
    MatchDistribution,
    SkillOverviewItem,
    ActivityItem,
    AdminStatsResponse
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Fetch latest resume
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    
    resume_score = 0
    ats_score = 0
    if latest_resume and latest_resume.analysis:
        resume_score = latest_resume.analysis.overall_score
        ats_score = latest_resume.analysis.ats_score
        
    # 2. Count Job Matches
    matches_count = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).count()
    
    # 3. Missing skills in latest job match
    latest_match = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.created_at.desc()).first()
    missing_skills_count = 0
    if latest_match and latest_match.analysis_json:
        missing_skills_count = len(latest_match.analysis_json.get("missing_skills", []))
        
    # 4. Calculate Profile Strength
    profile_strength = 20  # Base
    profile = current_user.profile
    if profile:
        if profile.target_role: profile_strength += 15
        if profile.experience_years > 0: profile_strength += 15
        if profile.location: profile_strength += 15
        if profile.preferred_industry: profile_strength += 15
    if len(current_user.skills) > 0:
        profile_strength += 10
    if latest_resume:
        profile_strength += 10
        
    profile_strength = min(profile_strength, 100)

    return {
        "resume_score": resume_score,
        "ats_score": ats_score,
        "job_matches": matches_count,
        "missing_skills": missing_skills_count,
        "profile_strength": profile_strength
    }

@router.get("/analytics", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Resume Score History
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.asc()).all()
    score_history = []
    for r in resumes:
        if r.analysis:
            date_str = r.created_at.strftime("%b %d")
            score_history.append(
                ScoreHistoryItem(date=date_str, score=r.analysis.overall_score)
            )
            
    if not score_history:
        score_history = [ScoreHistoryItem(date="Today", score=0)]
        
    # 2. Job Match Distribution
    matches = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).all()
    distribution = {"excellent": 0, "good": 0, "moderate": 0, "low": 0}
    for m in matches:
        if m.match_score >= 85:
            distribution["excellent"] += 1
        elif m.match_score >= 70:
            distribution["good"] += 1
        elif m.match_score >= 50:
            distribution["moderate"] += 1
        else:
            distribution["low"] += 1
            
    # Default values for demo if empty
    if len(matches) == 0:
        distribution = {"excellent": 4, "good": 8, "moderate": 3, "low": 1}
        
    match_dist = MatchDistribution(
        excellent=distribution["excellent"],
        good=distribution["good"],
        moderate=distribution["moderate"],
        low=distribution["low"]
    )
    
    # 3. Skills Overview
    skills_overview = []
    for s in current_user.skills:
        # Simple proficiency score mapper
        level = 85
        skills_overview.append(SkillOverviewItem(skill=s.name, level=level))
        
    if not skills_overview:
        skills_overview = [
            SkillOverviewItem(skill="React", level=90),
            SkillOverviewItem(skill="TypeScript", level=85),
            SkillOverviewItem(skill="Python", level=75)
        ]
        
    # 4. Weekly Activity (analyses logs last 7 days)
    today = datetime.datetime.utcnow().date()
    activity = []
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_name = day.strftime("%a")
        
        # Count activity logs for this day
        start_time = datetime.datetime.combine(day, datetime.time.min)
        end_time = datetime.datetime.combine(day, datetime.time.max)
        
        count = db.query(ActivityLog).filter(
            ActivityLog.user_id == current_user.id,
            ActivityLog.created_at >= start_time,
            ActivityLog.created_at <= end_time
        ).count()
        
        activity.append(ActivityItem(day=day_name, count=count))

    return DashboardAnalyticsResponse(
        resume_score_history=score_history,
        job_match_distribution=match_dist,
        skills_overview=skills_overview,
        weekly_activity=activity
    )

# Admin Endpoint
@router.get("/admin/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Role check
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires Admin role access"
        )
        
    total_users = db.query(User).count()
    total_resumes = db.query(Resume).count()
    total_job_matches = db.query(JobMatch).count()
    total_ai_analyses = db.query(ResumeAnalysis).count()
    
    # Daily Active Users (users logged activity today)
    today_start = datetime.datetime.combine(datetime.datetime.utcnow().date(), datetime.time.min)
    dau = db.query(User.id).join(ActivityLog).filter(ActivityLog.created_at >= today_start).distinct().count()
    
    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_job_matches": total_job_matches,
        "total_ai_analyses": total_ai_analyses,
        "daily_active_users": max(dau, 1) # Fallback to 1
    }
