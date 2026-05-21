"""
API routes for student management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from ...db.database import get_db
from ...schemas.student_schema import (
    StudentBulkDeleteRequest,
    StudentBulkDeleteResponse,
    StudentResponse,
    StudentCreate,
    StudentDetailResponse,
    StudentImportResult,
    StudentUpdate,
)
from ...services.student_service import StudentService
from ...models.student import User
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("", response_model=List[StudentResponse])
@router.get("/", response_model=List[StudentResponse])
async def get_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    class_id: int = Query(None, gt=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of students with optional filtering by class."""
    if class_id:
        students = StudentService.get_students_by_class(db, class_id, skip, limit)
    else:
        from ...crud.student_crud import StudentCRUD
        students = StudentCRUD.get_students(db, skip, limit)

    return students


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_data: StudentCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Create a new student (teacher/admin only)."""
    student, error = StudentService.create_student_with_validation(db, student_data)

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return student


@router.post("/import", response_model=StudentImportResult, status_code=status.HTTP_201_CREATED)
async def import_students(
    students_data: List[StudentCreate],
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Import students in bulk from spreadsheet-style data."""
    result = StudentService.bulk_import_students(db, students_data)
    return result


@router.post("/bulk-delete", response_model=StudentBulkDeleteResponse)
async def delete_students_bulk_post(
    payload: StudentBulkDeleteRequest,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Delete multiple students at once via explicit bulk endpoint."""
    from ...crud.student_crud import StudentCRUD

    result = StudentCRUD.delete_students(db, payload.student_ids)
    return result


@router.get("/{student_id:int}", response_model=StudentDetailResponse)
async def get_student(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific student."""
    student_details = StudentService.get_student_details(db, student_id)

    if not student_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    return student_details


@router.put("/{student_id:int}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Update student information (teacher/admin only)."""
    student, error = StudentService.update_student_with_validation(
        db, student_id, student_data
    )

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return student


@router.delete("", response_model=StudentBulkDeleteResponse)
@router.delete("/", response_model=StudentBulkDeleteResponse)
async def delete_students_bulk(
    payload: StudentBulkDeleteRequest,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Delete multiple students at once (teacher/admin only)."""
    from ...crud.student_crud import StudentCRUD

    result = StudentCRUD.delete_students(db, payload.student_ids)
    return result


@router.delete("/{student_id:int}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db)
):
    """Delete a student (teacher/admin only)."""
    from ...crud.student_crud import StudentCRUD
    
    success = StudentCRUD.delete_student(db, student_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    return None
