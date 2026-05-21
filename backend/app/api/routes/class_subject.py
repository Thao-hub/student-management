"""
API routes for class-subject management.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...crud.student_crud import ClassCRUD, ClassSubjectCRUD, SubjectCRUD
from ...crud.term_crud import HocKyCRUD
from ...crud.teacher_crud import GiaoVienCRUD
from ...db.database import get_db
from ...models.student import User
from ...schemas.student_schema import (
    ClassSubjectCreate,
    ClassSubjectResponse,
    ClassSubjectUpdate,
)
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/class-subjects", tags=["Class Subjects"])


def _validate_related_entities(db: Session, payload: ClassSubjectCreate | ClassSubjectUpdate):
    if payload.class_id is not None and not ClassCRUD.get_class(db, payload.class_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Class not found")
    if payload.subject_id is not None and not SubjectCRUD.get_subject(db, payload.subject_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject not found")
    if payload.academic_term_id is not None and not HocKyCRUD.get_term(db, payload.academic_term_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Academic term not found")
    if payload.teacher_id is not None and not GiaoVienCRUD.get_teacher(db, payload.teacher_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Teacher not found")


@router.get("", response_model=List[ClassSubjectResponse])
@router.get("/", response_model=List[ClassSubjectResponse])
async def get_class_subjects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ClassSubjectCRUD.get_class_subjects(db, skip, limit)


@router.get("/{class_subject_id}", response_model=ClassSubjectResponse)
async def get_class_subject(
    class_subject_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    class_subject = ClassSubjectCRUD.get_class_subject(db, class_subject_id)
    if not class_subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class subject not found")
    return class_subject


@router.post("", response_model=ClassSubjectResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ClassSubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_class_subject(
    class_subject_data: ClassSubjectCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    _validate_related_entities(db, class_subject_data)
    existing = ClassSubjectCRUD.get_class_subject_by_unique_fields(
        db,
        class_subject_data.class_id,
        class_subject_data.subject_id,
        class_subject_data.academic_term_id,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class subject mapping already exists",
        )
    return ClassSubjectCRUD.create_class_subject(db, class_subject_data)


@router.put("/{class_subject_id}", response_model=ClassSubjectResponse)
async def update_class_subject(
    class_subject_id: int,
    class_subject_data: ClassSubjectUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    db_class_subject = ClassSubjectCRUD.get_class_subject(db, class_subject_id)
    if not db_class_subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class subject not found")

    _validate_related_entities(db, class_subject_data)

    next_class_id = class_subject_data.class_id or db_class_subject.class_id
    next_subject_id = class_subject_data.subject_id or db_class_subject.subject_id
    next_term_id = class_subject_data.academic_term_id or db_class_subject.academic_term_id
    existing = ClassSubjectCRUD.get_class_subject_by_unique_fields(db, next_class_id, next_subject_id, next_term_id)
    if existing and existing.id != class_subject_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class subject mapping already exists",
        )

    return ClassSubjectCRUD.update_class_subject(db, db_class_subject, class_subject_data)


@router.delete("/{class_subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class_subject(
    class_subject_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    success = ClassSubjectCRUD.delete_class_subject(db, class_subject_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class subject not found")
    return None
