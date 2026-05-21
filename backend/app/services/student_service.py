"""
Business logic layer aligned with the current schema.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from ..core.security import create_access_token
from ..crud.student_crud import (
    ClassCRUD,
    EnrollmentCRUD,
    ScoreCRUD,
    StudentCRUD,
    SubjectCRUD,
    UserCRUD,
)
from ..models.student import Class, Score, Student, Subject, User
from ..schemas.student_schema import (
    ClassCreate,
    ScoreCreate,
    StudentCreate,
    StudentUpdate,
    SubjectCreate,
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
)


class StudentService:
    @staticmethod
    def get_student_details(db: Session, student_id: int) -> Optional[dict]:
        student = StudentCRUD.get_student(db, student_id)
        if not student:
            return None

        scores = ScoreCRUD.get_student_scores(db, student_id)
        return {
            "student": student,
            "class": student.class_info,
            "enrollments": student.enrollments,
            "scores": scores,
            "average_score": StudentService._calculate_average(scores) if scores else None,
        }

    @staticmethod
    def get_students_by_class(db: Session, class_id: int, skip: int = 0, limit: int = 100) -> List[Student]:
        if not ClassCRUD.get_class(db, class_id):
            return []
        return StudentCRUD.get_students(db, skip, limit, class_id)

    @staticmethod
    def create_student_with_validation(db: Session, student_data: StudentCreate) -> Tuple[Optional[Student], Optional[str]]:
        if not ClassCRUD.get_class(db, student_data.class_id):
            return None, "Class not found"

        if StudentCRUD.get_student_by_email(db, student_data.email):
            return None, "Email already registered"

        if StudentCRUD.get_student_by_code(db, student_data.student_code):
            return None, "Student code already exists"

        student = StudentCRUD.create_student(db, student_data)
        return student, None

    @staticmethod
    def update_student_with_validation(
        db: Session, student_id: int, student_data: StudentUpdate
    ) -> Tuple[Optional[Student], Optional[str]]:
        student = StudentCRUD.get_student(db, student_id)
        if not student:
            return None, "Student not found"

        if student_data.class_id and not ClassCRUD.get_class(db, student_data.class_id):
            return None, "Class not found"

        if student_data.email and student_data.email != student.email:
            if StudentCRUD.get_student_by_email(db, student_data.email):
                return None, "Email already in use"

        updated_student = StudentCRUD.update_student(db, student, student_data)
        return updated_student, None

    @staticmethod
    def bulk_import_students(
        db: Session,
        students_data: List[StudentCreate],
    ) -> dict:
        created_students: List[Student] = []
        errors: List[dict] = []

        for index, student_data in enumerate(students_data, start=1):
            student, error = StudentService.create_student_with_validation(db, student_data)
            if error:
                errors.append(
                    {
                        "row": index,
                        "student_code": student_data.student_code,
                        "error": error,
                    }
                )
                continue
            created_students.append(student)

        return {
            "created_count": len(created_students),
            "error_count": len(errors),
            "created_students": created_students,
            "errors": errors,
        }

    @staticmethod
    def _calculate_average(scores: List[Score]) -> float:
        if not scores:
            return 0.0
        total = sum(float(score.score) for score in scores)
        return round(total / len(scores), 2)


class ClassService:
    @staticmethod
    def get_class_with_students(db: Session, class_id: int) -> Optional[dict]:
        class_obj = ClassCRUD.get_class(db, class_id)
        if not class_obj:
            return None

        return {
            "class": class_obj,
            "students": class_obj.students,
            "student_count": len(class_obj.students),
            "class_subjects": class_obj.class_subjects,
        }

    @staticmethod
    def create_class_with_validation(db: Session, class_data: ClassCreate) -> Tuple[Optional[Class], Optional[str]]:
        if ClassCRUD.get_class_by_name(db, class_data.name):
            return None, "Class name already exists"

        class_obj = ClassCRUD.create_class(db, class_data)
        return class_obj, None


class SubjectService:
    @staticmethod
    def get_subject_with_scores(db: Session, subject_id: int) -> Optional[dict]:
        subject = SubjectCRUD.get_subject(db, subject_id)
        if not subject:
            return None

        scores = ScoreCRUD.get_subject_scores(db, subject_id)
        return {
            "subject": subject,
            "class_subjects": subject.class_subjects,
            "scores": scores,
            "score_count": len(scores),
            "average_score": StudentService._calculate_average(scores) if scores else None,
        }

    @staticmethod
    def create_subject_with_validation(
        db: Session, subject_data: SubjectCreate
    ) -> Tuple[Optional[Subject], Optional[str]]:
        if SubjectCRUD.get_subject_by_code(db, subject_data.code):
            return None, "Subject code already exists"

        subject = SubjectCRUD.create_subject(db, subject_data)
        return subject, None


class ScoreService:
    @staticmethod
    def create_score_with_validation(db: Session, score_data: ScoreCreate) -> Tuple[Optional[Score], Optional[str]]:
        enrollment = EnrollmentCRUD.get_enrollment(db, score_data.enrollment_id)
        if not enrollment:
            return None, "Enrollment not found"

        # Grade is computed from score/max_score in the Vietnamese schema mapping.
        score = ScoreCRUD.create_score(db, score_data)
        return score, None


class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserCreate) -> Tuple[Optional[User], Optional[str]]:
        if UserCRUD.get_user_by_username(db, user_data.username):
            return None, "Username already taken"

        if UserCRUD.get_user_by_email(db, user_data.email):
            return None, "Email already registered"

        user = UserCRUD.create_user(db, user_data)
        return user, None

    @staticmethod
    def login_user(db: Session, login_data: UserLogin) -> Tuple[Optional[Token], Optional[str]]:
        user = UserCRUD.authenticate_user(db, login_data.username, login_data.password)
        if not user:
            return None, "Invalid username or password"

        if not user.is_active:
            return None, "User account is inactive"

        access_token = create_access_token(
            data={"sub": user.username, "role": user.role},
            expires_delta=timedelta(minutes=30),
        )
        user_response = UserResponse.model_validate(user)
        token = Token(access_token=access_token, user=user_response)
        return token, None

    @staticmethod
    def get_current_user(db: Session, username: str) -> Optional[User]:
        return UserCRUD.get_user_by_username(db, username)
