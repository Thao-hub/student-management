from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.student import AcademicTerm
from ..schemas.term import HocKyCreate, HocKyUpdate


class HocKyCRUD:
    @staticmethod
    def get_term(db: Session, term_id: int) -> Optional[AcademicTerm]:
        return db.query(AcademicTerm).filter(AcademicTerm.id == term_id).first()

    @staticmethod
    def get_terms(db: Session, skip: int = 0, limit: int = 100) -> List[AcademicTerm]:
        return db.query(AcademicTerm).offset(skip).limit(limit).all()

    @staticmethod
    def create_term(db: Session, term: HocKyCreate) -> AcademicTerm:
        db_term = AcademicTerm(**term.model_dump())
        db.add(db_term)
        db.commit()
        db.refresh(db_term)
        return db_term

    @staticmethod
    def update_term(db: Session, db_term: AcademicTerm, term: HocKyUpdate) -> AcademicTerm:
        update_data = term.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_term, field, value)
        db.add(db_term)
        db.commit()
        db.refresh(db_term)
        return db_term

    @staticmethod
    def delete_term(db: Session, term_id: int) -> bool:
        db_term = db.query(AcademicTerm).filter(AcademicTerm.id == term_id).first()
        if not db_term:
            return False
        db.delete(db_term)
        db.commit()
        return True
