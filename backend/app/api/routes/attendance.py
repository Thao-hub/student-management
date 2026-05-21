"""
API routes for attendance management.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...crud.student_crud import AttendanceCRUD
from ...db.database import get_db
from ...models.student import User
from ...schemas.student_schema import AttendanceCreate, AttendanceResponse, AttendanceUpdate
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("", response_model=List[AttendanceResponse])
@router.get("/", response_model=List[AttendanceResponse])
async def get_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    enrollment_id: Optional[int] = Query(None, gt=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AttendanceCRUD.get_attendance(db, skip, limit, enrollment_id)


@router.get("/{attendance_id}", response_model=AttendanceResponse)
async def get_attendance_record(
    attendance_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attendance = AttendanceCRUD.get_attendance_record(db, attendance_id)
    if not attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
    return attendance


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance(
    attendance_data: AttendanceCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    return AttendanceCRUD.create_attendance(db, attendance_data)


@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(
    attendance_id: int,
    attendance_data: AttendanceUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    db_attendance = AttendanceCRUD.get_attendance_record(db, attendance_id)
    if not db_attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
    return AttendanceCRUD.update_attendance(db, db_attendance, attendance_data)


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendance(
    attendance_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    success = AttendanceCRUD.delete_attendance(db, attendance_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
    return None
