# System Architecture Documentation

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      React Application                        │   │
│  │  ┌─────────┬─────────┬──────────┬──────────┬────────────┐   │   │
│  │  │  Login  │Dashboard│ Students │ Classes  │  Subjects  │   │   │
│  │  └─────────┴─────────┴──────────┴──────────┴────────────┘   │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │          State Management (Context API)              │   │   │
│  │  │                   AuthContext                         │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │          Service Layer (Components)                  │   │   │
│  │  │  StudentService │ ClassService │ AuthService        │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────────────┘
                          │ HTTP/REST
                          │ (JSON over HTTPS)
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                      API GATEWAY / SERVER                            │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              FastAPI Application (Port 8000)                 │   │
│  │                                                               │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │         API ROUTES LAYER (Controllers)                │ │   │
│  │  │  /auth    /students   /classes                         │ │   │
│  │  │  /subjects   /scores                                   │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                          │                                     │   │
│  │  ┌────────────────────────▼────────────────────────────────┐ │   │
│  │  │       MIDDLEWARE LAYER (Authentication, CORS)          │ │   │
│  │  │  JWT Validation  │  CORS  │  Exception Handling        │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                          │                                     │   │
│  │  ┌────────────────────────▼────────────────────────────────┐ │   │
│  │  │      SERVICES LAYER (Business Logic)                  │ │   │
│  │  │  StudentService  ClassService  ScoreService           │ │   │
│  │  │  - Validation  - Rules  - Transformations            │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                          │                                     │   │
│  │  ┌────────────────────────▼────────────────────────────────┐ │   │
│  │  │      CRUD LAYER (Data Access)                         │ │   │
│  │  │  StudentCRUD  ClassCRUD  SubjectCRUD                 │ │   │
│  │  │  - Query Building  - Database Operations             │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                          │                                     │   │
│  │  ┌────────────────────────▼────────────────────────────────┐ │   │
│  │  │      MODELS LAYER (ORM)                               │ │   │
│  │  │  SQLAlchemy Models: User, Student, Class, Score       │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                          │                                     │   │
│  │  ┌────────────────────────▼────────────────────────────────┐ │   │
│  │  │      SCHEMAS LAYER (Data Validation)                  │ │   │
│  │  │  Pydantic Schemas: StudentCreate, ClassUpdate, etc.  │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                          │                                     │   │
│  │  ┌────────────────────────▼────────────────────────────────┐ │   │
│  │  │      CORE LAYER (Configuration & Security)            │ │   │
│  │  │  Config  │  JWT Security  │  Password Hashing        │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────────────┘
                          │ SQL
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                     DATABASE LAYER                                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              MySQL Database (Port 3306)                      │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │              Tables                                   │   │   │
│  │  │  ┌─────┬─────┬─────────┬───────┬─────────┐        │   │   │
│  │  │  │users│class│students │subject│ scores  │        │   │   │
│  │  │  └─────┴─────┴─────────┴───────┴─────────┘        │   │   │
│  │  │                                                    │   │   │
│  │  │  Relationships:                                    │   │   │
│  │  │  - Student (many) -> Class (1)                     │   │   │
│  │  │  - Score (many) -> Student (1)                     │   │   │
│  │  │  - Score (many) -> Subject (1)                     │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────┐
│   Browser   │ 1. User enters credentials
└──────┬──────┘
       │
       │ 2. POST /auth/login
       │    {username, password}
       │
       ▼
┌─────────────────────┐
│  FastAPI Backend    │ 3. Validate credentials
│                     │    (Compare hashed password)
│                     │
│  UserCRUD           │ 4. Create JWT token
│  Security.py        │    {exp, sub, role}
└──────┬──────────────┘
       │
       │ 5. Return token response
       │    {access_token, user_data}
       │
       ▼
┌─────────────┐
│   Browser   │ 6. Store token in localStorage
│  localStorage
└──────┬──────┘
       │
       │ 7. Add to header: "Authorization: Bearer TOKEN"
       │
       ▼
┌─────────────────────┐
│  API Request        │ 8. FastAPI validates token
│  with Bearer Token  │    (JWT decode, check expiry)
└──────┬──────────────┘
       │
       ├─ Valid ──────────────────► Process request
       │
       └─ Invalid ─────────────────► Redirect to login
```

## Data Flow Example: Create Student

```
1. Frontend: StudentForm component
   └─ User fills form and clicks "Save"

2. Frontend: StudentService.createStudent(data)
   └─ Axios POST to /api/v1/students
   └─ Include Authorization header with token

3. Backend: API Route Handler  
   └─ POST /students endpoint in routes/student.py
   └─ Validate JWT token via deps.get_current_user()
   └─ Check user role (teacher/admin only)

4. Backend: Input Validation
   └─ Pydantic validates StudentCreate schema
   └─ Check email format, student_id length, etc.

5. Backend: Service Layer
   └─ StudentService.create_student_with_validation()
   └─ Check class exists
   └─ Check email uniqueness
   └─ Check student_id uniqueness
   └─ Business logic validation

6. Backend: CRUD Layer
   └─ StudentCRUD.create_student()
   └─ Create SQLAlchemy model instance
   └─ Add to session

7. Backend: Database
   └─ MySQL INSERT student record
   └─ Commit transaction

8. Backend: Response
   └─ Return StudentResponse schema (201 Created)

9. Frontend: Handle Response
   └─ Update local state
   └─ Show success message
   └─ Refresh student list
```

## Layered Architecture Benefits

### 1. **Separation of Concerns**
```
Routes     -> HTTP handling only
Services   -> Business logic only
CRUD       -> Database operations only
Models     -> Data structure only
```

### 2. **Testability**
- Test each layer independently
- Mock dependencies above and below
- No need for database for route tests

### 3. **Maintainability**
- Clear responsibility boundaries
- Easy to find and fix bugs
- Easy to understand code flow

### 4. **Scalability**
- Add new endpoints easily
- Reuse services across routes
- Cache at service layer
- Add new CRUD operations without changing routes

### 5. **Code Reusability**
```
Multiple routes can use:
└─ Same service logic
└─ Same CRUD operations
└─ Same validation rules
└─ Same security mechanisms
```

## Request/Response Flow

### Successful Request
```
User Request
    │
    ├─ Route Handler
    │  ├─ Check Authorization
    │  └─ Validate Input
    │
    ├─ Service Layer
    │  ├─ Apply Business Rules
    │  └─ Call CRUD
    │
    ├─ CRUD Layer
    │  ├─ Query Database
    │  └─ Transform Results
    │
    ├─ Database
    │  └─ Execute Query
    │
    └─ Response (200 OK + data)
         Back to Frontend
```

### Error Handling
```
Request → Error Occurs
         ├─ Validation Error (400)
         ├─ Authorization Error (403)
         ├─ Not Found Error (404)
         ├─ Database Error (500)
         └─ Return Error Response
```

## API Request Lifecycle

```
1. Frontend sends HTTP request with JWT token
   GET /api/v1/students
   Header: Authorization: Bearer eyJhbG...

2. FastAPI receives request
   ├─ CORS middleware checks origin
   ├─ JWT middleware validates token
   └─ Route handler processes

3. Route handler executes
   ├─ Call get_current_user() dependency
   ├─ Check user permissions
   ├─ Parse request body (Pydantic)
   └─ Call service method

4. Service processes business logic
   ├─ Validate data
   ├─ Check constraints
   ├─ Call CRUD operations
   └─ Transform results

5. CRUD queries database
   ├─ Build SQL query
   ├─ Execute via SQLAlchemy
   ├─ Get results
   └─ Return to service

6. Response travels back
   Service → Route → Pydantic Schema → JSON

7. Frontend receives response
   ├─ Check status code
   ├─ Parse JSON
   ├─ Update state
   └─ Re-render UI
```

## Security Layers

```
1. HTTPS/TLS
   └─ Encrypt data in transit

2. CORS
   └─ Control which origins can access

3. Authentication (JWT)
   └─ Verify user identity

4. Authorization (Role-based)
   └─ Check user permissions

5. Input Validation (Pydantic)
   └─ Reject invalid data

6. SQL Injection Protection (SQLAlchemy ORM)
   └─ Prevent SQL injection

7. Password Hashing (Bcrypt)
   └─ Never store plaintext passwords

8. Error Handling
   └─ Hide sensitive information
```

## Performance Considerations

### Frontend
- Lazy loading of components
- Pagination for large lists
- Caching responses locally
- Minimize re-renders

### Backend
- Database indexes on foreign keys
- Connection pooling
- Query optimization
- Cache frequently accessed data
- Pagination of results

### Database
- Proper indexing strategy
- Normalization to avoid duplication
- Connection pool management
- Regular maintenance

---

This architecture ensures the system is:
- **Scalable**: Easy to add new features
- **Maintainable**: Clear code organization
- **Testable**: Isolated layers for testing
- **Secure**: Multiple security layers
- **Performant**: Optimized at each layer
