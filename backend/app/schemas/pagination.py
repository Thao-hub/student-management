"""
Pagination schemas and utilities for FastAPI responses.
"""

from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel

T = TypeVar('T')


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    total: int
    skip: int
    limit: int
    has_next: bool
    has_previous: bool
    pages: Optional[int] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""
    data: List[T]
    meta: PaginationMeta

    class Config:
        arbitrary_types_allowed = True


def get_pagination_meta(total: int, skip: int, limit: int) -> PaginationMeta:
    """Calculate pagination metadata."""
    pages = (total + limit - 1) // limit if limit > 0 else 1
    current_page = (skip // limit) + 1 if limit > 0 else 1
    
    return PaginationMeta(
        total=total,
        skip=skip,
        limit=limit,
        has_next=current_page < pages,
        has_previous=current_page > 1,
        pages=pages
    )
