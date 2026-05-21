"""
CRUD operations for teachers (giao_vien) aligned with the layered template.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.teacher import Teacher
from ..schemas.teacher import GiaoVienCreate, GiaoVienUpdate


class GiaoVienCRUD:
    @staticmethod
    def get_teacher(db: Session, teacher_id: int) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.id == teacher_id).first()

    @staticmethod
    def get_teacher_by_email(db: Session, email: str) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.email == email).first()

    @staticmethod
    def get_teacher_by_code(db: Session, teacher_code: str) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.teacher_code == teacher_code).first()

    @staticmethod
    def get_teachers(db: Session, skip: int = 0, limit: int = 100) -> List[Teacher]:
        return db.query(Teacher).offset(skip).limit(limit).all()

    @staticmethod
    def create_teacher(db: Session, teacher: GiaoVienCreate) -> Teacher:
        db_teacher = Teacher(**teacher.model_dump())
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
        return db_teacher

    @staticmethod
    def update_teacher(db: Session, db_teacher: Teacher, teacher: GiaoVienUpdate) -> Teacher:
        update_data = teacher.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_teacher, field, value)
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
        return db_teacher

    @staticmethod
    def delete_teacher(db: Session, teacher_id: int) -> bool:
        db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not db_teacher:
            return False
        db.delete(db_teacher)
        db.commit()
        return True
