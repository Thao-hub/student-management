"""
API routes for class management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from ...db.database import get_db
from ...schemas.student_schema import (
    ClassCreate,
    ClassDetailResponse,
    ClassResponse,
    ClassUpdate,
)
from ...services.student_service import ClassService
from ...crud.student_crud import ClassCRUD
from ...models.student import User
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/classes", tags=["Classes"])


@router.get("", response_model=List[ClassResponse])
@router.get("/", response_model=List[ClassResponse])
async def get_classes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all classes."""
    classes = ClassCRUD.get_classes(db, skip, limit)
    return classes


@router.get("/{class_id}", response_model=ClassDetailResponse)
async def get_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific class."""
    class_details = ClassService.get_class_with_students(db, class_id)

    if not class_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )

    return class_details


@router.post("", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    class_data: ClassCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Create a new class (teacher/admin only)."""
    class_obj, error = ClassService.create_class_with_validation(db, class_data)

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return class_obj


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: int,
    class_data: ClassUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Update class information (teacher/admin only)."""
    db_class = ClassCRUD.get_class(db, class_id)

    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )

    updated_class = ClassCRUD.update_class(db, db_class, class_data)
    return updated_class


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(
    class_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Delete a class (teacher/admin only)."""
    success = ClassCRUD.delete_class(db, class_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )

    return None
