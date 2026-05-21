from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class HocKyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    academic_year: str = Field(..., min_length=4, max_length=20)
    semester_no: int = Field(..., ge=1, le=3)
    start_date: date
    end_date: date
    status: str = Field(default="du_kien", pattern="^(du_kien|dang_dien_ra|da_ket_thuc)$")


class HocKyCreate(HocKyBase):
    pass


class HocKyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    academic_year: Optional[str] = Field(None, min_length=4, max_length=20)
    semester_no: Optional[int] = Field(None, ge=1, le=3)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(du_kien|dang_dien_ra|da_ket_thuc)$")


class HocKyResponse(HocKyBase):
    id: int

    class Config:
        from_attributes = True
