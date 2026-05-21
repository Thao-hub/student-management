# Student Management System - Developer Guide

## Project Overview

This is a full-stack student management system built with:
- **Frontend**: React 18 + Vite
- **Backend**: FastAPI
- **Database**: MySQL

The application uses a **layered architecture** for separation of concerns, maintainability, and scalability.

## Architecture

### Backend Architecture (3-Tier Layered)

```
API Routes (Presentation Layer)
    ↓
Services (Business Logic Layer)
    ↓
CRUD (Data Access Layer)
    ↓
Models & Database (Data Layer)
```

### Layer Responsibilities

1. **API Routes Layer** (`app/api/routes/`)
   - HTTP endpoints and request/response handling
   - Authorization & authentication
   - Input validation (via Pydantic schemas)

2. **Services Layer** (`app/services/`)
   - Business logic and rules
   - Data validation and transformation
   - Service coordination

3. **CRUD Layer** (`app/crud/`)
   - Direct database operations
   - SQL query execution
   - Transaction management

4. **Models & Database Layer** (`app/models/`, `app/db/`)
   - SQLAlchemy ORM models
   - Database connection and session management
   - Database schema definition

5. **Schemas & Config Layer** (`app/schemas/`, `app/core/`)
   - Pydantic models for data validation
   - Application configuration
   - Security utilities

### Frontend Architecture (Component-Based)

```
App
├── Context (AuthContext)
├── Routes (AppRoutes)
└── Pages
    ├── Login
    ├── Dashboard
    └── StudentPage
        ├── Components (Navbar, Sidebar, StudentForm)
        ├── Services (API calls)
        └── Hooks (Custom logic)
```

## Project Structure

### Backend

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # Dependency injection
│   │   └── routes/
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── student.py       # Student CRUD endpoints
│   │       ├── class_route.py   # Class management endpoints
│   │       ├── subject.py       # Subject management endpoints
│   │       └── score.py         # Score management endpoints
│   │
│   ├── core/
│   │   ├── config.py            # Configuration settings
│   │   └── security.py          # JWT and password utilities
│   │
│   ├── crud/
│   │   └── student_crud.py      # CRUD operations for all models
│   │
│   ├── db/
│   │   ├── base.py              # SQLAlchemy base
│   │   └── database.py          # Database connection
│   │
│   ├── models/
│   │   └── student.py           # ORM models
│   │
│   ├── schemas/
│   │   └── student_schema.py    # Pydantic schemas
│   │
│   ├── services/
│   │   └── student_service.py   # Business logic
│   │
│   ├── main.py                  # FastAPI app setup
│   └── __init__.py
│
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables
└── .gitignore
```

### Frontend

```
frontend/
├── public/
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation bar
│   │   ├── Sidebar.jsx          # Menu sidebar
│   │   ├── StudentForm.jsx      # Student form component
│   │   └── *.css                # Component styles
│   │
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Dashboard.jsx        # Dashboard page
│   │   ├── StudentPage.jsx      # Student management page
│   │   └── *.css                # Page styles
│   │
│   ├── services/
│   │   ├── api.js               # Axios instance
│   │   └── studentService.js    # API service classes
│   │
│   ├── hooks/
│   │   └── index.js             # Custom hooks (useAuth, useFetch, etc.)
│   │
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx        # Route configuration
│   │
│   ├── utils/
│   ├── assets/
│   │
│   ├── App.jsx                  # Main app component
│   ├── App.css
│   ├── index.css                # Global styles
│   └── main.jsx                 # Entry point
│
├── package.json
├── vite.config.js
├── index.html
└── .gitignore
```

## Data Models

### 1. User (Authentication)
```
- id (PK)
- username (unique)
- email (unique)
- hashed_password
- role (admin, teacher, student)
- is_active
- created_at, updated_at
```

### 2. Class
```
- id (PK)
- name (unique)
- description
- created_at, updated_at
```

### 3. Student
```
- id (PK)
- student_id (unique) - Mã sinh viên
- first_name
- last_name
- email (unique)
- phone
- date_of_birth
- gender
- address
- class_id (FK)
- enrollment_date
- status (Active, Inactive, Graduated)
- created_at, updated_at
```

### 4. Subject
```
- id (PK)
- name (unique)
- code (unique)
- credits
- description
- created_at, updated_at
```

### 5. Score
```
- id (PK)
- student_id (FK)
- subject_id (FK)
- score (0-10)
- grade (A, B, C, D, F)
- exam_date
- exam_type (Midterm, Final, Quiz)
- created_at, updated_at
```

## Setup Instructions

### Backend Setup

1. **Create Python virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment**
```bash
# Copy .env file and update with your settings
# DATABASE_URL, SECRET_KEY, etc.
```

4. **Create database**
```bash
mysql -u root -p < ../database/schema.sql
```

5. **Run server**
```bash
python -m uvicorn app.main:app --reload
```

Server runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Run development server**
```bash
npm run dev
```

App runs at: `http://localhost:3000`

3. **Build for production**
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token

### Students
- `GET /api/v1/students` - Get all students
- `GET /api/v1/students/{id}` - Get student details
- `POST /api/v1/students` - Create student
- `PUT /api/v1/students/{id}` - Update student
- `DELETE /api/v1/students/{id}` - Delete student

### Classes
- `GET /api/v1/classes` - Get all classes
- `GET /api/v1/classes/{id}` - Get class with students
- `POST /api/v1/classes` - Create class
- `PUT /api/v1/classes/{id}` - Update class
- `DELETE /api/v1/classes/{id}` - Delete class

### Subjects
- `GET /api/v1/subjects` - Get all subjects
- `GET /api/v1/subjects/{id}` - Get subject details
- `POST /api/v1/subjects` - Create subject
- `PUT /api/v1/subjects/{id}` - Update subject
- `DELETE /api/v1/subjects/{id}` - Delete subject

### Scores
- `GET /api/v1/scores/student/{id}` - Get student scores
- `GET /api/v1/scores/subject/{id}` - Get subject scores
- `GET /api/v1/scores/{id}` - Get score details
- `POST /api/v1/scores` - Create score
- `PUT /api/v1/scores/{id}` - Update score
- `DELETE /api/v1/scores/{id}` - Delete score

## Authentication Flow

1. User registers or logs in
2. Server returns JWT token
3. Token stored in localStorage
4. Frontend includes token in Authorization header
5. Backend validates token using dependency injection
6. Protected routes check user role

## Key Features

### Backend
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Teacher, Student)
- ✅ Layered architecture
- ✅ Automatic password hashing
- ✅ Automatic grade calculation
- ✅ Input validation with Pydantic
- ✅ CORS support
- ✅ Auto-generated API documentation

### Frontend
- ✅ React context for state management
- ✅ Protected routes
- ✅ Responsive design
- ✅ API service abstraction
- ✅ Form validation
- ✅ Error handling
- ✅ Token management

## Development Guidelines

### Backend Development
1. Follow the layered architecture
2. Keep business logic in services
3. Use CRUD for database operations
4. Validate input with Pydantic schemas
5. Write clear error messages
6. Use dependency injection

### Frontend Development
1. Create reusable components
2. Use hooks for logic
3. Manage global state with context
4. Keep API calls in service classes
5. Implement proper error handling
6. Use CSS modules or scoped CSS

## Environment Variables

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/student_management
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
APP_NAME=Student Management System
```

### Frontend
No .env needed for development (uses vite proxy)

## Common Issues & Solutions

### Database Connection
- Ensure MySQL is running
- Check DATABASE_URL credentials
- Verify database name matches

### CORS Issues
- Backend has CORS enabled for all origins
- Change `allow_origins=["*"]` in production

### Token Expiration
- Tokens expire after 30 minutes
- Implement refresh token endpoint for long sessions

## Next Steps

1. Add more pages (Subjects, Classes, Scores management)
2. Implement pagination and filtering
3. Add data export functionality (PDF, Excel)
4. Implement email notifications
5. Add dashboard charts and analytics
6. Implement file upload for student documents
7. Add audit logging
8. Implement advanced search and filtering

## Technology Stack Versions

- **React**: 18.2.0
- **Vite**: 5.0.0
- **FastAPI**: 0.104.1
- **SQLAlchemy**: 2.0.23
- **Python**: 3.8+
- **MySQL**: 8.0+

## References

- FastAPI Docs: https://fastapi.tiangolo.com/
- React Docs: https://react.dev/
- SQLAlchemy Docs: https://docs.sqlalchemy.org/
- Vite Docs: https://vitejs.dev/

---

**Last Updated**: April 7, 2026
**Version**: 1.0.0
