from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from ...db.database import get_db
from ...models.student import User
from ...schemas.teacher import GiaoVienCreate, GiaoVienOut, GiaoVienUpdate
from ...services.teacher_service import TeacherService
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.get("", response_model=List[GiaoVienOut])
@router.get("/", response_model=List[GiaoVienOut])
async def get_all(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return TeacherService.get_teachers(db, skip, limit)


@router.get("/{id}", response_model=GiaoVienOut)
async def get_one(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    teacher = TeacherService.get_teacher(db, id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.post("", response_model=GiaoVienOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=GiaoVienOut, status_code=status.HTTP_201_CREATED)
async def create(
    data: GiaoVienCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    teacher, error = TeacherService.create_teacher_with_validation(db, data)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return teacher


@router.put("/{id}", response_model=GiaoVienOut)
async def update(
    id: int,
    data: GiaoVienUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    teacher, error = TeacherService.update_teacher_with_validation(db, id, data)
    if error == "Teacher not found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return teacher


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    teacher = TeacherService.get_teacher(db, id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    TeacherService.delete_teacher(db, id)
    return None
