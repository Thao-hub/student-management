"""
API routes for room (phong_hoc) management.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...crud.room_crud import PhongHocCRUD
from ...db.database import get_db
from ...models.student import User
from ...schemas.room import PhongHocCreate, PhongHocResponse, PhongHocUpdate
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("", response_model=List[PhongHocResponse])
@router.get("/", response_model=List[PhongHocResponse])
async def get_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return PhongHocCRUD.get_rooms(db, skip, limit)


@router.get("/{room_id}", response_model=PhongHocResponse)
async def get_room(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    room = PhongHocCRUD.get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room


@router.post("", response_model=PhongHocResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PhongHocResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: PhongHocCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    if PhongHocCRUD.get_room_by_code(db, room_data.room_code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room code already exists")
    return PhongHocCRUD.create_room(db, room_data)


@router.put("/{room_id}", response_model=PhongHocResponse)
async def update_room(
    room_id: int,
    room_data: PhongHocUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    db_room = PhongHocCRUD.get_room(db, room_id)
    if not db_room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    if room_data.room_code and room_data.room_code != db_room.room_code:
        if PhongHocCRUD.get_room_by_code(db, room_data.room_code):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room code already exists")
    return PhongHocCRUD.update_room(db, db_room, room_data)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    success = PhongHocCRUD.delete_room(db, room_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return None
