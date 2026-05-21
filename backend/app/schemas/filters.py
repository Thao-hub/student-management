"""
Advanced filtering and sorting utilities for API queries.
"""

from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class SortDirection(str, Enum):
    """Sort direction enum."""
    ASC = "asc"
    DESC = "desc"


class FilterCondition(BaseModel):
    """Advanced filter condition."""
    field: str = Field(..., description="Field name to filter on")
    operator: str = Field(
        "eq",
        description="Filter operator: eq, ne, gt, lt, gte, lte, like, in"
    )
    value: str = Field(..., description="Filter value")


class SortField(BaseModel):
    """Sort field specification."""
    field: str = Field(..., description="Field name to sort by")
    direction: SortDirection = Field(SortDirection.ASC, description="Sort direction")


class AdvancedQueryParams(BaseModel):
    """Advanced query parameters."""
    filters: Optional[List[FilterCondition]] = Field(None, description="List of filter conditions")
    sort: Optional[List[SortField]] = Field(None, description="List of sort fields")
    skip: int = Field(0, ge=0, description="Number of items to skip")
    limit: int = Field(100, ge=1, le=1000, description="Number of items to return")
    search: Optional[str] = Field(None, description="Full-text search query")


def build_filter_query(db_query, model, filters: Optional[List[FilterCondition]]):
    """
    Build SQLAlchemy query with filters.
    
    Example:
        filters = [
            FilterCondition(field="name", operator="like", value="%john%"),
            FilterCondition(field="age", operator="gte", value="18")
        ]
    """
    if not filters:
        return db_query
    
    for filter_cond in filters:
        field = getattr(model, filter_cond.field, None)
        if field is None:
            continue
        
        if filter_cond.operator == "eq":
            db_query = db_query.filter(field == filter_cond.value)
        elif filter_cond.operator == "ne":
            db_query = db_query.filter(field != filter_cond.value)
        elif filter_cond.operator == "gt":
            db_query = db_query.filter(field > filter_cond.value)
        elif filter_cond.operator == "lt":
            db_query = db_query.filter(field < filter_cond.value)
        elif filter_cond.operator == "gte":
            db_query = db_query.filter(field >= filter_cond.value)
        elif filter_cond.operator == "lte":
            db_query = db_query.filter(field <= filter_cond.value)
        elif filter_cond.operator == "like":
            db_query = db_query.filter(field.like(filter_cond.value))
        elif filter_cond.operator == "in":
            values = filter_cond.value.split(",")
            db_query = db_query.filter(field.in_(values))
    
    return db_query


def build_sort_query(db_query, model, sort_fields: Optional[List[SortField]]):
    """Build SQLAlchemy query with sorting."""
    if not sort_fields:
        return db_query
    
    for sort in sort_fields:
        field = getattr(model, sort.field, None)
        if field is None:
            continue
        
        if sort.direction == SortDirection.ASC:
            db_query = db_query.order_by(field.asc())
        else:
            db_query = db_query.order_by(field.desc())
    
    return db_query
