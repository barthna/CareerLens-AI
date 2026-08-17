from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any

from app.core.database import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token
)
from app.models.models import User, UserProfile
from app.schemas.schemas import (
    UserCreate,
    UserLogin,
    Token,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system."
        )
    
    # Hash password and save
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password,
        role="USER"  # First user can be made admin manually or dynamically
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize an empty profile
    profile = UserProfile(user_id=new_user.id)
    db.add(profile)
    db.commit()
    
    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# Doc utility standard OAuth2 form login
@router.post("/login-oauth")
def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)) -> Any:
    email = verify_token(refresh_token, is_refresh=True)
    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token"
        )
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
        
    access_token = create_access_token(subject=user.email)
    new_refresh_token = create_refresh_token(subject=user.email)
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout() -> Any:
    # Stateless JWT logout is handled on client side, but we provide this hook.
    return {"success": True, "message": "Successfully logged out"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)) -> Any:
    # Verify user exists
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Avoid user enumeration - return success anyway
        return {"success": True, "message": "If the email exists, a reset link will be sent."}
    
    # Generate a reset token (reusing access token with short expiry e.g. 15m)
    reset_token = create_access_token(subject=user.email, expires_delta=timedelta(minutes=15))
    
    # In production, send email. For show-case/dev we return token or log it.
    print(f"Password reset token for {user.email}: {reset_token}")
    return {
        "success": True, 
        "message": "Reset token generated successfully.",
        "token": reset_token # Return to make it easy for frontend testing/demo without SMTP setup
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)) -> Any:
    email = verify_token(req.token, is_refresh=False)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
        
    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"success": True, "message": "Password reset successful"}
