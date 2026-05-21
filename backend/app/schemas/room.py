from typing import Optional

from pydantic import BaseModel, Field


class PhongHocBase(BaseModel):
    room_code: str = Field(..., min_length=1, max_length=50)
    building: Optional[str] = Field(None, max_length=100)
    floor_no: Optional[int] = Field(None, ge=0, le=200)
    capacity: Optional[int] = Field(None, ge=0, le=5000)
    room_type: str = Field(default="classroom", pattern="^(classroom|lab)$")


class PhongHocCreate(PhongHocBase):
    pass


class PhongHocUpdate(BaseModel):
    room_code: Optional[str] = Field(None, min_length=1, max_length=50)
    building: Optional[str] = Field(None, max_length=100)
    floor_no: Optional[int] = Field(None, ge=0, le=200)
    capacity: Optional[int] = Field(None, ge=0, le=5000)
    room_type: Optional[str] = Field(None, pattern="^(classroom|lab)$")


class PhongHocResponse(PhongHocBase):
    id: int

    class Config:
        from_attributes = True
