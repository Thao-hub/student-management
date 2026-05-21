from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class GiaoVienBase(BaseModel):
    ma_giao_vien: str = Field(..., min_length=1, max_length=50)
    ho: str = Field(..., min_length=1, max_length=100)
    ten: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=20)
    trinh_do: Optional[str] = Field(None, max_length=100)
    ngay_vao_lam: Optional[date] = None


class GiaoVienCreate(GiaoVienBase):
    pass


class GiaoVienUpdate(BaseModel):
    ma_giao_vien: Optional[str] = Field(None, min_length=1, max_length=50)
    ho: Optional[str] = Field(None, min_length=1, max_length=100)
    ten: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, min_length=3, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=20)
    trinh_do: Optional[str] = Field(None, max_length=100)
    ngay_vao_lam: Optional[date] = None


class GiaoVienOut(GiaoVienBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
