"""
API routes for academic term (hoc_ky) management.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...crud.term_crud import HocKyCRUD
from ...db.database import get_db
from ...models.student import User
from ...schemas.term import HocKyCreate, HocKyResponse, HocKyUpdate
from ..deps import get_current_user, get_teacher_user

router = APIRouter(prefix="/terms", tags=["Academic Terms"])


@router.get("", response_model=List[HocKyResponse])
@router.get("/", response_model=List[HocKyResponse])
async def get_terms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return HocKyCRUD.get_terms(db, skip, limit)


@router.get("/{term_id}", response_model=HocKyResponse)
async def get_term(
    term_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    term = HocKyCRUD.get_term(db, term_id)
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    return term


@router.post("", response_model=HocKyResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=HocKyResponse, status_code=status.HTTP_201_CREATED)
async def create_term(
    term_data: HocKyCreate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    return HocKyCRUD.create_term(db, term_data)


@router.put("/{term_id}", response_model=HocKyResponse)
async def update_term(
    term_id: int,
    term_data: HocKyUpdate,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    db_term = HocKyCRUD.get_term(db, term_id)
    if not db_term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    return HocKyCRUD.update_term(db, db_term, term_data)


@router.delete("/{term_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_term(
    term_id: int,
    current_user: User = Depends(get_teacher_user),
    db: Session = Depends(get_db),
):
    success = HocKyCRUD.delete_term(db, term_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    return None
