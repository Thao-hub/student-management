"""
API routes for authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...schemas.student_schema import UserCreate, UserLogin, Token, UserResponse
from ...services.student_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Public registration is disabled for this internal system."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Public registration is disabled. Please contact the administrator."
    )


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user and return JWT token."""
    token, error = AuthService.login_user(db, login_data)

    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error
        )

    return token


@router.post("/refresh", include_in_schema=False)
async def refresh_token():
    """Refresh JWT token."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Token refresh is not implemented."
    )
