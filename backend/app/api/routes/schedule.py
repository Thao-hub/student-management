"""
API routes for class schedule management.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...crud.student_crud import ClassScheduleCRUD
from ...db.database import get_db
from ...models.student import User
from ...schemas.student_schema import (
    ClassScheduleCreate,
    ClassScheduleResponse,
    ClassScheduleUpdate,
)
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/schedule", tags=["Schedule"])


@router.get("", response_model=List[ClassScheduleResponse])
@router.get("/", response_model=List[ClassScheduleResponse])
async def get_schedules(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    class_subject_id: Optional[int] = Query(None, gt=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ClassScheduleCRUD.get_schedules(db, skip, limit, class_subject_id)


@router.get("/{schedule_id}", response_model=ClassScheduleResponse)
async def get_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    schedule = ClassScheduleCRUD.get_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    return schedule


@router.post("", response_model=ClassScheduleResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ClassScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    schedule_data: ClassScheduleCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    return ClassScheduleCRUD.create_schedule(db, schedule_data)


@router.put("/{schedule_id}", response_model=ClassScheduleResponse)
async def update_schedule(
    schedule_id: int,
    schedule_data: ClassScheduleUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    db_schedule = ClassScheduleCRUD.get_schedule(db, schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    return ClassScheduleCRUD.update_schedule(db, db_schedule, schedule_data)


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    success = ClassScheduleCRUD.delete_schedule(db, schedule_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    return None
