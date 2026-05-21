# Implementation Guide for New Features

## 1. Security & Production Setup

### Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend  
   cp frontend/.env.example frontend/.env
   ```

2. Update values in `.env` files with your configuration:
   - Database credentials
   - SECRET_KEY (generate a secure key)
   - API endpoints
   - CORS allowed origins

### CORS Configuration

The CORS middleware now uses `settings.ALLOWED_ORIGINS` from config:

```python
# backend/app/core/config.py
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

For production, specify exact domains:
```python
ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://app.yourdomain.com",
]
```

### Password Hashing

Passwords are hashed using bcrypt with 12 rounds:
- `get_password_hash()`: Hash plaintext password
- `verify_password()`: Verify plaintext against hash
- Never store plaintext passwords

---

## 2. Frontend Enhancements

### Using the `useApi` Hook

Custom hook for API calls with automatic loading/error handling:

```jsx
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from '../components/LoadingSpinner';

function StudentPage() {
  const { data, loading, error, execute } = useApi('/students');
  
  useEffect(() => {
    execute(); // Fetch students
  }, []);
  
  if (loading) return <LoadingSpinner text="Loading students..." />;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div>
      {data?.map(student => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  );
}
```

### Using ErrorBoundary

Wrap components to catch errors gracefully:

```jsx
import { ErrorBoundary } from '../components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### LoadingSpinner Component

Show loading state:

```jsx
<LoadingSpinner text="Loading..." />
```

---

## 3. Backend Features

### Pagination

Use pagination utilities for consistent responses:

```python
from app.schemas.pagination import PaginatedResponse, get_pagination_meta

@router.get("/students", response_model=PaginatedResponse)
async def get_students(skip: int = 0, limit: int = 100):
    total = StudentCRUD.count_students(db)
    students = StudentCRUD.get_students(db, skip, limit)
    meta = get_pagination_meta(total, skip, limit)
    return PaginatedResponse(data=students, meta=meta)
```

Response format:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "skip": 0,
    "limit": 100,
    "has_next": true,
    "has_previous": false,
    "pages": 2
  }
}
```

### Advanced Filtering & Sorting

```python
from app.schemas.filters import (
  AdvancedQueryParams,
  FilterCondition,
  SortField,
  build_filter_query,
  build_sort_query
)

@router.post("/students/search")
async def search_students(params: AdvancedQueryParams):
    query = db.query(Student)
    
    # Apply filters
    query = build_filter_query(query, Student, params.filters)
    
    # Apply sorting
    query = build_sort_query(query, Student, params.sort)
    
    # Pagination
    students = query.offset(params.skip).limit(params.limit).all()
    return students
```

Example request body:
```json
{
  "filters": [
    {"field": "name", "operator": "like", "value": "%john%"},
    {"field": "age", "operator": "gte", "value": "18"}
  ],
  "sort": [
    {"field": "name", "direction": "asc"},
    {"field": "date_created", "direction": "desc"}
  ],
  "skip": 0,
  "limit": 50
}
```

---

## 4. Testing

### Backend Unit Tests

Create `backend/tests/test_services.py`:

```python
import pytest
from app.services.student_service import StudentService

def test_get_student_details(db_session):
    # Arrange
    student = StudentCRUD.create_student(db_session, student_data)
    
    # Act
    result = StudentService.get_student_details(db_session, student.id)
    
    # Assert
    assert result is not None
    assert result['student'].id == student.id
```

### Frontend Component Tests

Create `frontend/src/components/__tests__/LoadingSpinner.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders loading text', () => {
    render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### API Integration Tests

Create `backend/tests/test_api.py`:

```python
def test_get_students_endpoint(client):
    response = client.get("/api/v1/students")
    assert response.status_code == 200
    assert "data" in response.json()
    assert "meta" in response.json()
```

---

## Next Steps

1. **Complete frontend**: Add dark mode, responsive design, charts
2. **Add testing**: Set up pytest, coverage reports
3. **Deploy**: Docker, environment-specific configs
4. **Monitor**: Add logging, error tracking (Sentry)
5. **Optimize**: Database indexing, query optimization

---

## Files Modified/Created

- ✅ `backend/.env.example` - Environment template
- ✅ `frontend/.env.example` - Environment template
- ✅ `backend/app/core/config.py` - Updated CORS config
- ✅ `backend/app/main.py` - Updated CORS middleware
- ✅ `frontend/src/hooks/useApi.js` - API hook with loading/error
- ✅ `frontend/src/components/LoadingSpinner.jsx` - Loading component
- ✅ `frontend/src/components/ErrorBoundary.jsx` - Error handling
- ✅ `backend/app/schemas/pagination.py` - Pagination utilities
- ✅ `backend/app/schemas/filters.py` - Advanced filtering utilities

---

## Resources

- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [bcrypt Documentation](https://en.wikipedia.org/wiki/Bcrypt)
- [SQLAlchemy Query](https://docs.sqlalchemy.org/en/20/orm/queryguide/index.html)
