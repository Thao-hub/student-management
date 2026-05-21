"""
Business logic layer for teachers (giao_vien), following the student template.
"""

from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from ..crud.teacher_crud import GiaoVienCRUD
from ..models.student import Teacher
from ..schemas.teacher import GiaoVienCreate, GiaoVienUpdate


class TeacherService:
    @staticmethod
    def get_teachers(db: Session, skip: int = 0, limit: int = 100) -> List[Teacher]:
        return GiaoVienCRUD.get_teachers(db, skip, limit)

    @staticmethod
    def get_teacher(db: Session, teacher_id: int) -> Optional[Teacher]:
        return GiaoVienCRUD.get_teacher(db, teacher_id)

    @staticmethod
    def create_teacher_with_validation(db: Session, teacher_data: GiaoVienCreate) -> Tuple[Optional[Teacher], Optional[str]]:
        if GiaoVienCRUD.get_teacher_by_email(db, teacher_data.email):
            return None, "Email already registered"

        if GiaoVienCRUD.get_teacher_by_code(db, teacher_data.ma_giao_vien):
            return None, "Teacher code already exists"

        teacher = GiaoVienCRUD.create_teacher(db, teacher_data)
        return teacher, None

    @staticmethod
    def update_teacher_with_validation(
        db: Session, teacher_id: int, teacher_data: GiaoVienUpdate
    ) -> Tuple[Optional[Teacher], Optional[str]]:
        teacher = GiaoVienCRUD.get_teacher(db, teacher_id)
        if not teacher:
            return None, "Teacher not found"

        if teacher_data.email and teacher_data.email != teacher.email:
            if GiaoVienCRUD.get_teacher_by_email(db, teacher_data.email):
                return None, "Email already in use"

        if teacher_data.ma_giao_vien and teacher_data.ma_giao_vien != teacher.ma_giao_vien:
            if GiaoVienCRUD.get_teacher_by_code(db, teacher_data.ma_giao_vien):
                return None, "Teacher code already exists"

        updated = GiaoVienCRUD.update_teacher(db, teacher, teacher_data)
        return updated, None

    @staticmethod
    def delete_teacher(db: Session, teacher_id: int) -> bool:
        return GiaoVienCRUD.delete_teacher(db, teacher_id)
