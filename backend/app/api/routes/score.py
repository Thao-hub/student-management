"""
API routes for score management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from ...db.database import get_db
from ...schemas.student_schema import (
    ScoreResponse, ScoreCreate, ScoreUpdate
)
from ...services.student_service import ScoreService
from ...crud.student_crud import ScoreCRUD
from ...models.student import User
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/scores", tags=["Scores"])


@router.get("", response_model=List[ScoreResponse])
@router.get("/", response_model=List[ScoreResponse])
async def get_scores(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all scores."""
    return ScoreCRUD.get_scores(db, skip, limit)


@router.get("/student/{student_id}", response_model=List[ScoreResponse])
async def get_student_scores(
    student_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all scores for a specific student."""
    scores = ScoreCRUD.get_student_scores(db, student_id, skip, limit)
    return scores


@router.get("/subject/{subject_id}", response_model=List[ScoreResponse])
async def get_subject_scores(
    subject_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all scores for a specific subject."""
    scores = ScoreCRUD.get_subject_scores(db, subject_id, skip, limit)
    return scores


@router.get("/{score_id}", response_model=ScoreResponse)
async def get_score(
    score_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific score."""
    score = ScoreCRUD.get_score(db, score_id)

    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found"
        )

    return score


@router.post("", response_model=ScoreResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ScoreResponse, status_code=status.HTTP_201_CREATED)
async def create_score(
    score_data: ScoreCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Create a new score (teacher/admin only)."""
    score, error = ScoreService.create_score_with_validation(db, score_data)

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return score


@router.put("/{score_id}", response_model=ScoreResponse)
async def update_score(
    score_id: int,
    score_data: ScoreUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Update a score (teacher/admin only)."""
    db_score = ScoreCRUD.get_score(db, score_id)

    if not db_score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found"
        )

    updated_score = ScoreCRUD.update_score(db, db_score, score_data)
    return updated_score


@router.delete("/{score_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_score(
    score_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Delete a score (teacher/admin only)."""
    success = ScoreCRUD.delete_score(db, score_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found"
        )

    return None
