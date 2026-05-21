"""
Compatibility model for the Vietnamese teacher (giao_vien) table.

The canonical SQLAlchemy mapping for this table lives in `app.models.student.Teacher`.
Some CRUD/modules still import `GiaoVien`, so we re-export it here.
"""

from .student import Teacher

__all__ = ["Teacher"]
