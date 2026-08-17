from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import User
from app.schemas.schemas import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login-oauth"  # Standard OAuth2 form token url
)

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify the token is a valid access token
    subject = verify_token(token, is_refresh=False)
    if subject is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == subject).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user
