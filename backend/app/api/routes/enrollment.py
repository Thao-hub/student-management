"""
API routes for enrollment management.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...crud.student_crud import EnrollmentCRUD
from ...db.database import get_db
from ...models.student import User
from ...schemas.student_schema import EnrollmentCreate, EnrollmentResponse, EnrollmentUpdate
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.get("", response_model=List[EnrollmentResponse])
@router.get("/", response_model=List[EnrollmentResponse])
async def get_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    student_id: Optional[int] = Query(None, gt=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return EnrollmentCRUD.get_enrollments(db, skip, limit, student_id)


@router.get("/{enrollment_id}", response_model=EnrollmentResponse)
async def get_enrollment(
    enrollment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollment = EnrollmentCRUD.get_enrollment(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return enrollment


@router.post("", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    enrollment_data: EnrollmentCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    from ...crud.student_crud import StudentCRUD

    if not StudentCRUD.get_student(db, enrollment_data.student_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student not found")
    if not EnrollmentCRUD.get_class_subject(db, enrollment_data.class_subject_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Class subject not found")
    return EnrollmentCRUD.create_enrollment(db, enrollment_data)


@router.put("/{enrollment_id}", response_model=EnrollmentResponse)
async def update_enrollment(
    enrollment_id: int,
    enrollment_data: EnrollmentUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    db_enrollment = EnrollmentCRUD.get_enrollment(db, enrollment_id)
    if not db_enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return EnrollmentCRUD.update_enrollment(db, db_enrollment, enrollment_data)


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_enrollment(
    enrollment_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    success = EnrollmentCRUD.delete_enrollment(db, enrollment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return None
