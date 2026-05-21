"""
API routes for subject management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from ...db.database import get_db
from ...schemas.student_schema import (
    SubjectCreate,
    SubjectDetailResponse,
    SubjectResponse,
    SubjectUpdate,
)
from ...services.student_service import SubjectService
from ...crud.student_crud import SubjectCRUD
from ...models.student import User
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get("", response_model=List[SubjectResponse])
@router.get("/", response_model=List[SubjectResponse])
async def get_subjects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all subjects."""
    subjects = SubjectCRUD.get_subjects(db, skip, limit)
    return subjects


@router.get("/{subject_id}", response_model=SubjectDetailResponse)
async def get_subject(
    subject_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific subject."""
    subject_details = SubjectService.get_subject_with_scores(db, subject_id)

    if not subject_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )

    return subject_details


@router.post("", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject_data: SubjectCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Create a new subject (teacher/admin only)."""
    subject, error = SubjectService.create_subject_with_validation(db, subject_data)

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return subject


@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: int,
    subject_data: SubjectUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Update subject information (teacher/admin only)."""
    db_subject = SubjectCRUD.get_subject(db, subject_id)

    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )

    updated_subject = SubjectCRUD.update_subject(db, db_subject, subject_data)
    return updated_subject


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Delete a subject (teacher/admin only)."""
    success = SubjectCRUD.delete_subject(db, subject_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )

    return None
