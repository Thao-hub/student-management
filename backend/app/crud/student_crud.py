"""
CRUD operations aligned with the current schema.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from ..core.security import get_password_hash, verify_password
from ..models.student import (
    Attendance,
    Class,
    ClassSchedule,
    ClassSubject,
    Enrollment,
    Score,
    Student,
    Subject,
    User,
)
from ..schemas.student_schema import (
    AttendanceCreate,
    AttendanceUpdate,
    ClassCreate,
    ClassScheduleCreate,
    ClassScheduleUpdate,
    ClassUpdate,
    EnrollmentCreate,
    EnrollmentUpdate,
    ScoreCreate,
    ScoreUpdate,
    StudentCreate,
    StudentUpdate,
    SubjectCreate,
    SubjectUpdate,
    UserCreate,
)


class StudentCRUD:
    @staticmethod
    def get_student(db: Session, student_id: int) -> Optional[Student]:
        return db.query(Student).filter(Student.id == student_id).first()

    @staticmethod
    def get_student_by_email(db: Session, email: str) -> Optional[Student]:
        return db.query(Student).filter(Student.email == email).first()

    @staticmethod
    def get_student_by_code(db: Session, student_code: str) -> Optional[Student]:
        return db.query(Student).filter(Student.student_code == student_code).first()

    @staticmethod
    def get_students(db: Session, skip: int = 0, limit: int = 100, class_id: Optional[int] = None) -> List[Student]:
        query = db.query(Student)
        if class_id:
            query = query.filter(Student.class_id == class_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_student(db: Session, student: StudentCreate) -> Student:
        db_student = Student(**student.model_dump())
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def update_student(db: Session, db_student: Student, student: StudentUpdate) -> Student:
        update_data = student.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_student, field, value)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def delete_student(db: Session, student_id: int) -> bool:
        db_student = db.query(Student).filter(Student.id == student_id).first()
        if not db_student:
            return False
        db.delete(db_student)
        db.commit()
        return True

    @staticmethod
    def delete_students(db: Session, student_ids: List[int]) -> dict:
        unique_ids = list(dict.fromkeys(student_ids))
        students = db.query(Student).filter(Student.id.in_(unique_ids)).all()
        found_ids = {student.id for student in students}
        missing_ids = [student_id for student_id in unique_ids if student_id not in found_ids]

        for student in students:
            db.delete(student)

        db.commit()
        return {
            "deleted_count": len(students),
            "missing_ids": missing_ids,
        }


class ClassCRUD:
    @staticmethod
    def get_class(db: Session, class_id: int) -> Optional[Class]:
        return db.query(Class).filter(Class.id == class_id).first()

    @staticmethod
    def get_class_by_name(db: Session, name: str) -> Optional[Class]:
        return db.query(Class).filter(Class.name == name).first()

    @staticmethod
    def get_classes(db: Session, skip: int = 0, limit: int = 100) -> List[Class]:
        return db.query(Class).offset(skip).limit(limit).all()

    @staticmethod
    def create_class(db: Session, class_obj: ClassCreate) -> Class:
        payload = class_obj.model_dump()
        # Vietnamese schema `lop_hoc` has no `description` column.
        payload.pop("description", None)
        db_class = Class(**payload)
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
        return db_class

    @staticmethod
    def update_class(db: Session, db_class: Class, class_obj: ClassUpdate) -> Class:
        update_data = class_obj.model_dump(exclude_unset=True)
        update_data.pop("description", None)
        for field, value in update_data.items():
            setattr(db_class, field, value)
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
        return db_class

    @staticmethod
    def delete_class(db: Session, class_id: int) -> bool:
        db_class = db.query(Class).filter(Class.id == class_id).first()
        if not db_class:
            return False
        db.delete(db_class)
        db.commit()
        return True


class SubjectCRUD:
    @staticmethod
    def get_subject(db: Session, subject_id: int) -> Optional[Subject]:
        return db.query(Subject).filter(Subject.id == subject_id).first()

    @staticmethod
    def get_subject_by_code(db: Session, code: str) -> Optional[Subject]:
        return db.query(Subject).filter(Subject.code == code).first()

    @staticmethod
    def get_subjects(db: Session, skip: int = 0, limit: int = 100) -> List[Subject]:
        return db.query(Subject).offset(skip).limit(limit).all()

    @staticmethod
    def create_subject(db: Session, subject: SubjectCreate) -> Subject:
        payload = subject.model_dump()
        # Vietnamese schema `mon_hoc` has no `is_active` column.
        payload.pop("is_active", None)
        db_subject = Subject(**payload)
        db.add(db_subject)
        db.commit()
        db.refresh(db_subject)
        return db_subject

    @staticmethod
    def update_subject(db: Session, db_subject: Subject, subject: SubjectUpdate) -> Subject:
        update_data = subject.model_dump(exclude_unset=True)
        update_data.pop("is_active", None)
        for field, value in update_data.items():
            setattr(db_subject, field, value)
        db.add(db_subject)
        db.commit()
        db.refresh(db_subject)
        return db_subject

    @staticmethod
    def delete_subject(db: Session, subject_id: int) -> bool:
        db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not db_subject:
            return False
        db.delete(db_subject)
        db.commit()
        return True


class ClassSubjectCRUD:
    @staticmethod
    def get_class_subject(db: Session, class_subject_id: int) -> Optional[ClassSubject]:
        return db.query(ClassSubject).filter(ClassSubject.id == class_subject_id).first()

    @staticmethod
    def get_class_subjects(db: Session, skip: int = 0, limit: int = 100) -> List[ClassSubject]:
        return db.query(ClassSubject).offset(skip).limit(limit).all()

    @staticmethod
    def get_class_subject_by_unique_fields(
        db: Session, class_id: int, subject_id: int, academic_term_id: int
    ) -> Optional[ClassSubject]:
        return (
            db.query(ClassSubject)
            .filter(
                ClassSubject.class_id == class_id,
                ClassSubject.subject_id == subject_id,
                ClassSubject.academic_term_id == academic_term_id,
            )
            .first()
        )

    @staticmethod
    def create_class_subject(db: Session, class_subject) -> ClassSubject:
        db_class_subject = ClassSubject(**class_subject.model_dump())
        db.add(db_class_subject)
        db.commit()
        db.refresh(db_class_subject)
        return db_class_subject

    @staticmethod
    def update_class_subject(db: Session, db_class_subject: ClassSubject, class_subject) -> ClassSubject:
        update_data = class_subject.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_class_subject, field, value)
        db.add(db_class_subject)
        db.commit()
        db.refresh(db_class_subject)
        return db_class_subject

    @staticmethod
    def delete_class_subject(db: Session, class_subject_id: int) -> bool:
        db_class_subject = db.query(ClassSubject).filter(ClassSubject.id == class_subject_id).first()
        if not db_class_subject:
            return False
        db.delete(db_class_subject)
        db.commit()
        return True


class EnrollmentCRUD:
    @staticmethod
    def get_enrollment(db: Session, enrollment_id: int) -> Optional[Enrollment]:
        return db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

    @staticmethod
    def get_class_subject(db: Session, class_subject_id: int) -> Optional[ClassSubject]:
        return db.query(ClassSubject).filter(ClassSubject.id == class_subject_id).first()

    @staticmethod
    def get_enrollments(
        db: Session, skip: int = 0, limit: int = 100, student_id: Optional[int] = None
    ) -> List[Enrollment]:
        query = db.query(Enrollment)
        if student_id:
            query = query.filter(Enrollment.student_id == student_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_enrollment(db: Session, enrollment: EnrollmentCreate) -> Enrollment:
        db_enrollment = Enrollment(**enrollment.model_dump())
        db.add(db_enrollment)
        db.commit()
        db.refresh(db_enrollment)
        return db_enrollment

    @staticmethod
    def update_enrollment(db: Session, db_enrollment: Enrollment, enrollment: EnrollmentUpdate) -> Enrollment:
        update_data = enrollment.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_enrollment, field, value)
        db.add(db_enrollment)
        db.commit()
        db.refresh(db_enrollment)
        return db_enrollment

    @staticmethod
    def delete_enrollment(db: Session, enrollment_id: int) -> bool:
        db_enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
        if not db_enrollment:
            return False
        db.delete(db_enrollment)
        db.commit()
        return True


class ClassScheduleCRUD:
    @staticmethod
    def get_schedule(db: Session, schedule_id: int) -> Optional[ClassSchedule]:
        return db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()

    @staticmethod
    def get_schedules(
        db: Session, skip: int = 0, limit: int = 100, class_subject_id: Optional[int] = None
    ) -> List[ClassSchedule]:
        query = db.query(ClassSchedule)
        if class_subject_id:
            query = query.filter(ClassSchedule.class_subject_id == class_subject_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_schedule(db: Session, schedule: ClassScheduleCreate) -> ClassSchedule:
        payload = schedule.model_dump()
        # Vietnamese schema `lich_hoc` doesn't store `is_active` (always treated as active).
        payload.pop("is_active", None)
        db_schedule = ClassSchedule(**payload)
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        return db_schedule

    @staticmethod
    def update_schedule(db: Session, db_schedule: ClassSchedule, schedule: ClassScheduleUpdate) -> ClassSchedule:
        update_data = schedule.model_dump(exclude_unset=True)
        update_data.pop("is_active", None)
        for field, value in update_data.items():
            setattr(db_schedule, field, value)
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        return db_schedule

    @staticmethod
    def delete_schedule(db: Session, schedule_id: int) -> bool:
        db_schedule = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
        if not db_schedule:
            return False
        db.delete(db_schedule)
        db.commit()
        return True


class AttendanceCRUD:
    @staticmethod
    def get_attendance_record(db: Session, attendance_id: int) -> Optional[Attendance]:
        return db.query(Attendance).filter(Attendance.id == attendance_id).first()

    @staticmethod
    def get_attendance(
        db: Session, skip: int = 0, limit: int = 100, enrollment_id: Optional[int] = None
    ) -> List[Attendance]:
        query = db.query(Attendance)
        if enrollment_id:
            query = query.filter(Attendance.enrollment_id == enrollment_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_attendance(db: Session, attendance: AttendanceCreate) -> Attendance:
        db_attendance = Attendance(**attendance.model_dump())
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        return db_attendance

    @staticmethod
    def update_attendance(db: Session, db_attendance: Attendance, attendance: AttendanceUpdate) -> Attendance:
        update_data = attendance.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_attendance, field, value)
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        return db_attendance

    @staticmethod
    def delete_attendance(db: Session, attendance_id: int) -> bool:
        db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
        if not db_attendance:
            return False
        db.delete(db_attendance)
        db.commit()
        return True


class ScoreCRUD:
    @staticmethod
    def get_scores(db: Session, skip: int = 0, limit: int = 100) -> List[Score]:
        return db.query(Score).offset(skip).limit(limit).all()

    @staticmethod
    def get_score(db: Session, score_id: int) -> Optional[Score]:
        return db.query(Score).filter(Score.id == score_id).first()

    @staticmethod
    def get_student_scores(db: Session, student_id: int, skip: int = 0, limit: int = 100) -> List[Score]:
        return (
            db.query(Score)
            .join(Enrollment, Enrollment.id == Score.enrollment_id)
            .filter(Enrollment.student_id == student_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_subject_scores(db: Session, subject_id: int, skip: int = 0, limit: int = 100) -> List[Score]:
        return (
            db.query(Score)
            .join(Enrollment, Enrollment.id == Score.enrollment_id)
            .join(ClassSubject, ClassSubject.id == Enrollment.class_subject_id)
            .filter(ClassSubject.subject_id == subject_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create_score(db: Session, score: ScoreCreate) -> Score:
        payload = score.model_dump()
        # `grade` is a computed property in the Vietnamese schema mapping.
        payload.pop("grade", None)
        db_score = Score(**payload)
        db.add(db_score)
        db.commit()
        db.refresh(db_score)
        return db_score

    @staticmethod
    def update_score(db: Session, db_score: Score, score: ScoreUpdate) -> Score:
        update_data = score.model_dump(exclude_unset=True)
        update_data.pop("grade", None)
        for field, value in update_data.items():
            setattr(db_score, field, value)
        db.add(db_score)
        db.commit()
        db.refresh(db_score)
        return db_score

    @staticmethod
    def delete_score(db: Session, score_id: int) -> bool:
        db_score = db.query(Score).filter(Score.id == score_id).first()
        if not db_score:
            return False
        db.delete(db_score)
        db.commit()
        return True


class UserCRUD:
    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        user = UserCRUD.get_user_by_username(db, username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        db.delete(db_user)
        db.commit()
        return True
