from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.student import Room
from ..schemas.room import PhongHocCreate, PhongHocUpdate


class PhongHocCRUD:
    @staticmethod
    def get_room(db: Session, room_id: int) -> Optional[Room]:
        return db.query(Room).filter(Room.id == room_id).first()

    @staticmethod
    def get_room_by_code(db: Session, room_code: str) -> Optional[Room]:
        return db.query(Room).filter(Room.room_code == room_code).first()

    @staticmethod
    def get_rooms(db: Session, skip: int = 0, limit: int = 100) -> List[Room]:
        return db.query(Room).offset(skip).limit(limit).all()

    @staticmethod
    def create_room(db: Session, room: PhongHocCreate) -> Room:
        db_room = Room(**room.model_dump())
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room

    @staticmethod
    def update_room(db: Session, db_room: Room, room: PhongHocUpdate) -> Room:
        update_data = room.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_room, field, value)
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room

    @staticmethod
    def delete_room(db: Session, room_id: int) -> bool:
        db_room = db.query(Room).filter(Room.id == room_id).first()
        if not db_room:
            return False
        db.delete(db_room)
        db.commit()
        return True
