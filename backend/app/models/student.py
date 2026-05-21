"""
SQLAlchemy ORM models mapped to the Vietnamese MySQL schema (quan_ly_sinh_vien).

The public API (Pydantic schemas + frontend) still uses the existing English
field names such as `student_code`, `first_name`, `role`, etc. These models map
those attributes to Vietnamese table/column names and translate enum values via
Python properties.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    DECIMAL,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    literal,
)
from sqlalchemy.orm import column_property, relationship

from ..db.base import Base


ROLE_DB_TO_API = {
    "quan_tri": "admin",
    "giao_vien": "teacher",
    "sinh_vien": "student",
}
ROLE_API_TO_DB = {value: key for key, value in ROLE_DB_TO_API.items()}

GENDER_DB_TO_API = {
    "Nam": "Male",
    "Nu": "Female",
    "Khac": "Other",
}
GENDER_API_TO_DB = {value: key for key, value in GENDER_DB_TO_API.items()}

STUDENT_STATUS_DB_TO_API = {
    "Dang_hoc": "Active",
    "Tam_dung": "Inactive",
    "Tot_nghiep": "Graduated",
    "Bao_luu": "Suspended",
}
STUDENT_STATUS_API_TO_DB = {value: key for key, value in STUDENT_STATUS_DB_TO_API.items()}

ENROLLMENT_STATUS_DB_TO_API = {
    "dang_hoc": "enrolled",
    "rut_mon": "dropped",
    "hoan_thanh": "completed",
    "khong_dat": "failed",
}
ENROLLMENT_STATUS_API_TO_DB = {value: key for key, value in ENROLLMENT_STATUS_DB_TO_API.items()}

ATTENDANCE_STATUS_DB_TO_API = {
    "Co_mat": "Present",
    "Vang": "Absent",
    "Tre": "Late",
    "Co_phep": "Excused",
}
ATTENDANCE_STATUS_API_TO_DB = {value: key for key, value in ATTENDANCE_STATUS_DB_TO_API.items()}


class User(Base):
    __tablename__ = "tai_khoan"

    id = Column(Integer, primary_key=True, index=True)
    username = Column("ten_dang_nhap", String(100), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column("mat_khau_ma_hoa", String(255), nullable=False)
    _role_db = Column("vai_tro", Enum("quan_tri", "giao_vien", "sinh_vien"), nullable=False, default="sinh_vien")
    created_at = Column("ngay_tao", DateTime, default=datetime.utcnow)
    updated_at = Column("ngay_cap_nhat", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # The schema doesn't have an is_active field. Keep API compatibility.
    is_active = column_property(literal(True, type_=Boolean))

    teacher_profile = relationship("Teacher", back_populates="user", uselist=False)
    student_profile = relationship("Student", back_populates="user", uselist=False)

    @property
    def role(self) -> str:
        return ROLE_DB_TO_API.get(self._role_db, "student")

    @role.setter
    def role(self, value: str) -> None:
        self._role_db = ROLE_API_TO_DB.get(value, "sinh_vien")


class Teacher(Base):
    __tablename__ = "giao_vien"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column("tai_khoan_id", Integer, ForeignKey("tai_khoan.id", ondelete="SET NULL"), unique=True, nullable=True)
    teacher_code = Column("ma_giao_vien", String(50), unique=True, nullable=False, index=True)
    last_name = Column("ho", String(100), nullable=False)
    first_name = Column("ten", String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column("so_dien_thoai", String(20), nullable=True)
    qualification = Column("trinh_do", String(100), nullable=True)
    hire_date = Column("ngay_vao_lam", Date, nullable=True)
    created_at = Column("ngay_tao", DateTime, default=datetime.utcnow)
    updated_at = Column("ngay_cap_nhat", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Not available in schema, keep compatibility.
    is_active = column_property(literal(True, type_=Boolean))

    user = relationship("User", back_populates="teacher_profile")
    homeroom_classes = relationship("Class", back_populates="homeroom_teacher")
    assignments = relationship("ClassSubject", back_populates="teacher")

    # --- Vietnamese API compatibility (used by /teachers endpoints) ---
    @property
    def ma_giao_vien(self) -> str:
        return self.teacher_code

    @ma_giao_vien.setter
    def ma_giao_vien(self, value: str) -> None:
        self.teacher_code = value

    @property
    def ho(self) -> str:
        return self.last_name

    @ho.setter
    def ho(self, value: str) -> None:
        self.last_name = value

    @property
    def ten(self) -> str:
        return self.first_name

    @ten.setter
    def ten(self, value: str) -> None:
        self.first_name = value

    @property
    def so_dien_thoai(self) -> str | None:
        return self.phone

    @so_dien_thoai.setter
    def so_dien_thoai(self, value: str | None) -> None:
        self.phone = value

    @property
    def trinh_do(self) -> str | None:
        return self.qualification

    @trinh_do.setter
    def trinh_do(self, value: str | None) -> None:
        self.qualification = value

    @property
    def ngay_vao_lam(self):
        return self.hire_date

    @ngay_vao_lam.setter
    def ngay_vao_lam(self, value) -> None:
        self.hire_date = value


class AcademicTerm(Base):
    __tablename__ = "hoc_ky"

    id = Column(Integer, primary_key=True, index=True)
    name = Column("ten_hoc_ky", String(100), nullable=False)
    academic_year = Column("nam_hoc", String(20), nullable=False)
    semester_no = Column("so_hoc_ky", Integer, nullable=False)
    start_date = Column("ngay_bat_dau", Date, nullable=False)
    end_date = Column("ngay_ket_thuc", Date, nullable=False)
    status = Column("trang_thai", Enum("du_kien", "dang_dien_ra", "da_ket_thuc"), nullable=False, default="du_kien")

    class_subjects = relationship("ClassSubject", back_populates="academic_term")

    @property
    def is_current(self) -> bool:
        return self.status == "dang_dien_ra"


class Room(Base):
    __tablename__ = "phong_hoc"

    id = Column(Integer, primary_key=True, index=True)
    room_code = Column("ma_phong", String(50), unique=True, nullable=False)
    building = Column("toa_nha", String(100), nullable=True)
    floor_no = Column("tang", Integer, nullable=True)
    capacity = Column("suc_chua", Integer, nullable=True)
    _room_type_db = Column("loai_phong", Enum("phong_hoc", "phong_lab"), nullable=False, default="phong_hoc")

    schedules = relationship("ClassSchedule", back_populates="room")

    @property
    def room_type(self) -> str:
        return "lab" if self._room_type_db == "phong_lab" else "classroom"

    @room_type.setter
    def room_type(self, value: str) -> None:
        self._room_type_db = "phong_lab" if value in {"lab", "phong_lab"} else "phong_hoc"


class Class(Base):
    __tablename__ = "lop_hoc"

    id = Column(Integer, primary_key=True, index=True)
    name = Column("ten_lop", String(100), nullable=False)
    grade_level = Column("khoi_lop", String(20), nullable=True)
    academic_year = Column("nam_hoc", String(20), nullable=True)
    homeroom_teacher_id = Column(
        "giao_vien_chu_nhiem_id", Integer, ForeignKey("giao_vien.id", ondelete="SET NULL"), nullable=True
    )
    capacity = Column("si_so_toi_da", Integer, nullable=True)
    created_at = Column("ngay_tao", DateTime, default=datetime.utcnow)
    updated_at = Column("ngay_cap_nhat", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    students = relationship("Student", back_populates="class_info")
    class_subjects = relationship("ClassSubject", back_populates="class_info")
    homeroom_teacher = relationship("Teacher", back_populates="homeroom_classes")

    @property
    def description(self) -> str | None:
        # `lop_hoc` has no description column in the Vietnamese schema.
        return None


class Subject(Base):
    __tablename__ = "mon_hoc"

    id = Column(Integer, primary_key=True, index=True)
    code = Column("ma_mon", String(50), unique=True, nullable=False)
    name = Column("ten_mon", String(100), unique=True, nullable=False)
    credits = Column("so_tin_chi", Integer, nullable=False, default=3)
    description = Column("mo_ta", Text, nullable=True)

    # Not present in schema; keep API compatibility.
    is_active = column_property(literal(True, type_=Boolean))
    created_at = column_property(literal(None))
    updated_at = column_property(literal(None))

    class_subjects = relationship("ClassSubject", back_populates="subject")


class Student(Base):
    __tablename__ = "sinh_vien"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column("tai_khoan_id", Integer, ForeignKey("tai_khoan.id", ondelete="SET NULL"), unique=True, nullable=True)
    student_code = Column("ma_sinh_vien", String(50), unique=True, nullable=False, index=True)
    last_name = Column("ho", String(100), nullable=False)
    first_name = Column("ten", String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column("so_dien_thoai", String(20), nullable=True)
    date_of_birth = Column("ngay_sinh", Date, nullable=True)
    _gender_db = Column("gioi_tinh", Enum("Nam", "Nu", "Khac"), nullable=True)
    address = Column("dia_chi", Text, nullable=True)
    class_id = Column("lop_hoc_id", Integer, ForeignKey("lop_hoc.id", ondelete="RESTRICT"), nullable=False, index=True)
    enrollment_date = Column("ngay_nhap_hoc", Date, nullable=False)
    guardian_name = Column("ten_nguoi_giam_ho", String(150), nullable=True)
    guardian_phone = Column("so_dien_thoai_giam_ho", String(20), nullable=True)
    _status_db = Column(
        "trang_thai",
        Enum("Dang_hoc", "Bao_luu", "Tot_nghiep", "Tam_dung"),
        nullable=False,
        default="Dang_hoc",
    )
    created_at = Column("ngay_tao", DateTime, default=datetime.utcnow)
    updated_at = Column("ngay_cap_nhat", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    class_info = relationship("Class", back_populates="students")
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")

    @property
    def gender(self) -> str | None:
        if self._gender_db is None:
            return None
        return GENDER_DB_TO_API.get(self._gender_db, "Other")

    @gender.setter
    def gender(self, value: str | None) -> None:
        if value in (None, ""):
            self._gender_db = None
            return
        self._gender_db = GENDER_API_TO_DB.get(value, value)

    @property
    def status(self) -> str:
        return STUDENT_STATUS_DB_TO_API.get(self._status_db, "Active")

    @status.setter
    def status(self, value: str) -> None:
        self._status_db = STUDENT_STATUS_API_TO_DB.get(value, value)


class ClassSubject(Base):
    """
    Map the current API concept of "class_subject" to Vietnamese `lop_mon_hoc`.
    """

    __tablename__ = "lop_mon_hoc"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column("lop_hoc_id", Integer, ForeignKey("lop_hoc.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column("mon_hoc_id", Integer, ForeignKey("mon_hoc.id", ondelete="CASCADE"), nullable=False)
    academic_term_id = Column("hoc_ky_id", Integer, ForeignKey("hoc_ky.id", ondelete="RESTRICT"), nullable=False)
    teacher_id = Column("giao_vien_id", Integer, ForeignKey("giao_vien.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column("ngay_phan_cong", Date, nullable=True)
    is_required = Column("bat_buoc", Boolean, nullable=False, default=True)

    created_at = column_property(literal(None))

    class_info = relationship("Class", back_populates="class_subjects")
    subject = relationship("Subject", back_populates="class_subjects")
    academic_term = relationship("AcademicTerm", back_populates="class_subjects")
    teacher = relationship("Teacher", back_populates="assignments")
    enrollments = relationship("Enrollment", back_populates="class_subject", cascade="all, delete-orphan")
    schedules = relationship("ClassSchedule", back_populates="class_subject", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "dang_ky_hoc"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column("sinh_vien_id", Integer, ForeignKey("sinh_vien.id", ondelete="CASCADE"), nullable=False, index=True)
    class_subject_id = Column(
        "lop_mon_hoc_id", Integer, ForeignKey("lop_mon_hoc.id", ondelete="CASCADE"), nullable=False, index=True
    )
    enrolled_at = Column("ngay_dang_ky", DateTime, nullable=False, default=datetime.utcnow)
    _status_db = Column(
        "trang_thai",
        Enum("dang_hoc", "rut_mon", "hoan_thanh", "khong_dat"),
        nullable=False,
        default="dang_hoc",
    )
    notes = Column("ghi_chu", Text, nullable=True)
    created_at = Column("ngay_tao", DateTime, default=datetime.utcnow)
    updated_at = Column("ngay_cap_nhat", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="enrollments")
    class_subject = relationship("ClassSubject", back_populates="enrollments")
    scores = relationship("Score", back_populates="enrollment", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="enrollment", cascade="all, delete-orphan")

    @property
    def status(self) -> str:
        return ENROLLMENT_STATUS_DB_TO_API.get(self._status_db, "enrolled")

    @status.setter
    def status(self, value: str) -> None:
        self._status_db = ENROLLMENT_STATUS_API_TO_DB.get(value, value)


class ClassSchedule(Base):
    __tablename__ = "lich_hoc"

    id = Column(Integer, primary_key=True, index=True)
    class_subject_id = Column(
        "lop_mon_hoc_id", Integer, ForeignKey("lop_mon_hoc.id", ondelete="CASCADE"), nullable=False, index=True
    )
    room_id = Column("phong_hoc_id", Integer, ForeignKey("phong_hoc.id", ondelete="SET NULL"), nullable=True)
    day_of_week = Column(
        "thu_trong_tuan",
        Enum("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"),
        nullable=False,
    )
    start_time = Column("gio_bat_dau", Time, nullable=False)
    end_time = Column("gio_ket_thuc", Time, nullable=False)
    lesson_no = Column("tiet_hoc", Integer, nullable=True)
    created_at = Column("ngay_tao", DateTime, default=datetime.utcnow)
    updated_at = Column("ngay_cap_nhat", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Keep API compatibility.
    is_active = column_property(literal(True, type_=Boolean))

    class_subject = relationship("ClassSubject", back_populates="schedules")
    room = relationship("Room", back_populates="schedules")
    attendance_records = relationship("Attendance", back_populates="class_schedule", cascade="all, delete-orphan")

    @property
    def teacher_id(self) -> int | None:
        # Teacher is assigned at the `lop_mon_hoc` level.
        return self.class_subject.teacher_id if self.class_subject else None

    @teacher_id.setter
    def teacher_id(self, value) -> None:  # noqa: ANN001
        # Ignore (not stored on lich_hoc).
        return


class Score(Base):
    __tablename__ = "diem_so"

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(
        "dang_ky_hoc_id", Integer, ForeignKey("dang_ky_hoc.id", ondelete="CASCADE"), nullable=False, index=True
    )
    score_type = Column("loai_diem", Enum("Quiz", "Assignment", "Midterm", "Final", "Practice"), nullable=False)
    score = Column("diem", DECIMAL(5, 2), nullable=False)
    max_score = Column("diem_toi_da", DECIMAL(5, 2), nullable=False, default=10.00)
    weight = Column("trong_so", DECIMAL(5, 2), nullable=False, default=1.00)
    exam_date = Column("ngay_kiem_tra", Date, nullable=True)
    remarks = Column("nhan_xet", String(255), nullable=True)
    created_at = Column("ngay_tao", DateTime, default=datetime.utcnow)
    updated_at = Column("ngay_cap_nhat", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    enrollment = relationship("Enrollment", back_populates="scores")

    @property
    def grade(self) -> str | None:
        try:
            max_value = float(self.max_score or 0)
            score_value = float(self.score or 0)
        except (TypeError, ValueError):
            return None

        normalized = (score_value / max_value) * 10 if max_value else 0
        if normalized >= 8.5:
            return "A"
        if normalized >= 7.0:
            return "B"
        if normalized >= 5.5:
            return "C"
        if normalized >= 4.0:
            return "D"
        return "F"

    @grade.setter
    def grade(self, value) -> None:  # noqa: ANN001
        # Computed field, not stored.
        return


class Attendance(Base):
    __tablename__ = "diem_danh"

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(
        "dang_ky_hoc_id", Integer, ForeignKey("dang_ky_hoc.id", ondelete="CASCADE"), nullable=False, index=True
    )
    class_schedule_id = Column(
        "lich_hoc_id", Integer, ForeignKey("lich_hoc.id", ondelete="CASCADE"), nullable=False, index=True
    )
    class_subject_id = Column(
        "lop_mon_hoc_id", Integer, ForeignKey("lop_mon_hoc.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attendance_date = Column("ngay_diem_danh", Date, nullable=False)
    _status_db = Column("trang_thai", Enum("Co_mat", "Vang", "Tre", "Co_phep"), nullable=False, default="Co_mat")
    notes = Column("ghi_chu", Text, nullable=True)
    created_at = Column("ngay_tao", DateTime, default=datetime.utcnow)
    updated_at = Column("ngay_cap_nhat", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    enrollment = relationship("Enrollment", back_populates="attendance_records")
    class_schedule = relationship("ClassSchedule", back_populates="attendance_records")

    @property
    def status(self) -> str:
        return ATTENDANCE_STATUS_DB_TO_API.get(self._status_db, "Present")

    @status.setter
    def status(self, value: str) -> None:
        self._status_db = ATTENDANCE_STATUS_API_TO_DB.get(value, value)
