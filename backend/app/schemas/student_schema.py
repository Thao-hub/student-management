"""
Pydantic schemas aligned with the current database schema.
"""

from datetime import date, datetime, time
from typing import List, Optional

from pydantic import BaseModel, Field


class ClassBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    grade_level: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    academic_year: Optional[str] = Field(None, max_length=20)
    homeroom_teacher_id: Optional[int] = Field(None, gt=0)
    capacity: Optional[int] = Field(None, gt=0)


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    grade_level: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    academic_year: Optional[str] = Field(None, max_length=20)
    homeroom_teacher_id: Optional[int] = Field(None, gt=0)
    capacity: Optional[int] = Field(None, gt=0)


class ClassResponse(ClassBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=50)
    credits: int = Field(default=3, ge=1, le=8)
    description: Optional[str] = None
    is_active: bool = True


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    credits: Optional[int] = Field(None, ge=1, le=8)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SubjectResponse(SubjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudentBase(BaseModel):
    student_code: str = Field(..., min_length=1, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(Male|Female|Other)$")
    address: Optional[str] = None
    class_id: int = Field(..., gt=0)
    enrollment_date: date
    guardian_name: Optional[str] = Field(None, max_length=150)
    guardian_phone: Optional[str] = Field(None, max_length=20)
    status: str = Field(default="Active", pattern="^(Active|Inactive|Graduated|Suspended)$")


class StudentCreate(StudentBase):
    user_id: Optional[int] = Field(None, gt=0)


class StudentUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, min_length=3, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(Male|Female|Other)$")
    address: Optional[str] = None
    class_id: Optional[int] = Field(None, gt=0)
    enrollment_date: Optional[date] = None
    guardian_name: Optional[str] = Field(None, max_length=150)
    guardian_phone: Optional[str] = Field(None, max_length=20)
    status: Optional[str] = Field(None, pattern="^(Active|Inactive|Graduated|Suspended)$")


class StudentResponse(StudentBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnrollmentBase(BaseModel):
    student_id: int = Field(..., gt=0)
    class_subject_id: int = Field(..., gt=0)
    status: str = Field(default="enrolled", pattern="^(enrolled|dropped|completed|failed)$")
    notes: Optional[str] = None


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(enrolled|dropped|completed|failed)$")
    notes: Optional[str] = None


class EnrollmentResponse(EnrollmentBase):
    id: int
    enrolled_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClassScheduleBase(BaseModel):
    class_subject_id: int = Field(..., gt=0)
    teacher_id: int = Field(..., gt=0)
    room_id: Optional[int] = Field(None, gt=0)
    day_of_week: str = Field(..., pattern="^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$")
    start_time: time
    end_time: time
    lesson_no: Optional[int] = Field(None, gt=0)
    is_active: bool = True


class ClassScheduleCreate(ClassScheduleBase):
    pass


class ClassScheduleUpdate(BaseModel):
    teacher_id: Optional[int] = Field(None, gt=0)
    room_id: Optional[int] = Field(None, gt=0)
    day_of_week: Optional[str] = Field(None, pattern="^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$")
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    lesson_no: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None


class ClassScheduleResponse(ClassScheduleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    enrollment_id: int = Field(..., gt=0)
    class_schedule_id: int = Field(..., gt=0)
    class_subject_id: int = Field(..., gt=0)
    attendance_date: date
    status: str = Field(default="Present", pattern="^(Present|Absent|Late|Excused)$")
    notes: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    attendance_date: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(Present|Absent|Late|Excused)$")
    notes: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScoreBase(BaseModel):
    enrollment_id: int = Field(..., gt=0)
    score_type: str = Field(..., pattern="^(Quiz|Assignment|Midterm|Final|Practice)$")
    score: float = Field(..., ge=0)
    max_score: float = Field(default=10.0, gt=0)
    weight: float = Field(default=1.0, gt=0)
    grade: Optional[str] = Field(None, max_length=5)
    exam_date: Optional[date] = None
    remarks: Optional[str] = Field(None, max_length=255)


class ScoreCreate(ScoreBase):
    pass


class ScoreUpdate(BaseModel):
    score_type: Optional[str] = Field(None, pattern="^(Quiz|Assignment|Midterm|Final|Practice)$")
    score: Optional[float] = Field(None, ge=0)
    max_score: Optional[float] = Field(None, gt=0)
    weight: Optional[float] = Field(None, gt=0)
    grade: Optional[str] = Field(None, max_length=5)
    exam_date: Optional[date] = None
    remarks: Optional[str] = Field(None, max_length=255)


class ScoreResponse(ScoreBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: str = Field(..., min_length=3, max_length=100)
    role: str = Field(default="student", pattern="^(admin|teacher|student)$")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    email: Optional[str] = Field(None, min_length=3, max_length=100)
    role: Optional[str] = Field(None, pattern="^(admin|teacher|student)$")
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ClassSubjectBase(BaseModel):
    class_id: int
    subject_id: int
    academic_term_id: int
    teacher_id: Optional[int] = None
    assigned_at: Optional[date] = None
    is_required: bool = True


class ClassSubjectCreate(ClassSubjectBase):
    pass


class ClassSubjectUpdate(BaseModel):
    class_id: Optional[int] = Field(None, gt=0)
    subject_id: Optional[int] = Field(None, gt=0)
    academic_term_id: Optional[int] = Field(None, gt=0)
    teacher_id: Optional[int] = Field(None, gt=0)
    assigned_at: Optional[date] = None
    is_required: Optional[bool] = None


class ClassSubjectResponse(ClassSubjectBase):
    id: int

    class Config:
        from_attributes = True


class StudentDetailResponse(BaseModel):
    student: StudentResponse
    class_info: Optional[ClassResponse] = Field(None, alias="class")
    enrollments: List[EnrollmentResponse] = []
    scores: List[ScoreResponse] = []
    average_score: Optional[float] = None

    class Config:
        populate_by_name = True


class ClassDetailResponse(BaseModel):
    class_info: ClassResponse = Field(..., alias="class")
    students: List[StudentResponse] = []
    student_count: int = 0
    class_subjects: List[ClassSubjectResponse] = []

    class Config:
        populate_by_name = True


class SubjectDetailResponse(BaseModel):
    subject: SubjectResponse
    class_subjects: List[ClassSubjectResponse] = []
    scores: List[ScoreResponse] = []
    score_count: int = 0
    average_score: Optional[float] = None


class StudentImportError(BaseModel):
    row: int
    student_code: Optional[str] = None
    error: str


class StudentImportResult(BaseModel):
    created_count: int
    error_count: int
    created_students: List[StudentResponse] = []
    errors: List[StudentImportError] = []


class StudentBulkDeleteRequest(BaseModel):
    student_ids: List[int] = Field(..., min_length=1)


class StudentBulkDeleteResponse(BaseModel):
    deleted_count: int
    missing_ids: List[int] = []
