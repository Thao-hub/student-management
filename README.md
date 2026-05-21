# Student Management System

A modern, full-stack student management system built with **ReactJS (Vite)**, **FastAPI**, and **MySQL** using a **layered architecture** for flexibility, maintainability, and scalability.

## 🚀 Quick Start

Get up and running in 5 minutes:

1. **Setup Database**: `mysql -u root -p < database/schema.sql`
2. **Run Backend**: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python -m uvicorn app.main:app --reload`
3. **Run Frontend**: `cd frontend && npm install && npm run dev`

Visit **http://localhost:3000** and login with:
- Username: `admin`
- Password: `admin123` (or register a new account)

For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)

## 📋 Project Structure

```
student-management-system/
├── frontend/                  # React + Vite (Port 3000)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service classes
│   │   ├── context/          # State management
│   │   ├── hooks/            # Custom React hooks
│   │   └── routes/           # Route configuration
│   └── package.json
│
├── backend/                   # FastAPI (Port 8000)
│   ├── app/
│   │   ├── api/              # API routes and dependencies
│   │   ├── core/             # Config and security
│   │   ├── crud/             # Database operations
│   │   ├── db/               # Database setup
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── main.py           # FastAPI app
│   ├── requirements.txt
│   └── .env
│
├── database/
│   └── schema.sql            # MySQL schema
│
├── docs/                      # Documentation
├── README.md                  # This file
├── QUICK_START.md            # Quick setup guide
└── DEVELOPER_GUIDE.md        # Detailed architecture guide
```

## 🏗️ Architecture

### Backend - Layered Architecture

```
API Routes (HTTP endpoints)
    ↓
Services (Business logic)
    ↓
CRUD (Database operations)
    ↓
Models (Database schema)
```

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Easy to test each layer independently
- ✅ Simple to add new features
- ✅ Better code organization and maintainability

### Frontend - Component-Based Architecture

```
App (Root)
├── AuthContext (Global auth state)
├── AppRoutes (Route configuration)
└── Pages & Components
```

**Benefits:**
- ✅ Reusable components
- ✅ Centralized state management
- ✅ Clear data flow

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.2.0 |
| | Vite | 5.0.0 |
| | React Router | 6.20.0 |
| | Axios | 1.6.0 |
| **Backend** | FastAPI | 0.104.1 |
| | SQLAlchemy | 2.0.23 |
| | Pydantic | 2.5.0 |
| | Python-jose (JWT) | 3.3.0 |
| **Database** | MySQL | 8.0+ |

## 📚 Core Features

### Authentication & Authorization
- ✅ User login for issued accounts
- ✅ JWT-based tokens
- ✅ Role-based access control (Admin, Teacher, Student)
- ✅ Secure password hashing

### Student Management
- ✅ Create, read, update, delete students
- ✅ Filter students by class
- ✅ View student details with scores
- ✅ Track enrollment and status

### Academic Management
- ✅ Manage classes (lớp học)
- ✅ Manage subjects (môn học)
- ✅ Record student scores with automatic grading
- ✅ Track exam types (Midterm, Final, Quiz)

### User Interface
- ✅ Responsive design (mobile-friendly)
- ✅ Dashboard with statistics
- ✅ Search and filter
- ✅ Form validation
- ✅ Error handling

### API Features
- ✅ RESTful endpoints
- ✅ Auto-generated API documentation (Swagger)
- ✅ CORS enabled
- ✅ Input validation

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/login        - Login user
```

Note: public self-registration and refresh-token flows are not enabled in the current internal deployment.

### Students
```
GET    /api/v1/students          - List all students
GET    /api/v1/students/{id}     - Get student details
POST   /api/v1/students          - Create student
POST   /api/v1/students/import   - Bulk import students
POST   /api/v1/students/bulk-delete - Bulk delete students
PUT    /api/v1/students/{id}     - Update student
DELETE /api/v1/students/{id}     - Delete student
```

### Classes, Subjects, Scores
Similar RESTful endpoints for:
- `/api/v1/classes`
- `/api/v1/subjects`
- `/api/v1/scores`

**Full API Documentation available at**: `http://localhost:8000/docs` (when server running)

## 🗄️ Database Schema

### Key Tables
- **users**: Authentication and user roles
- **classes**: Class information (lớp học)
- **students**: Student data with class assignment
- **subjects**: Subject/course information
- **scores**: Student scores with automatic grading

All tables have:
- Primary keys for relations
- Timestamps (created_at, updated_at)
- Proper indexes for performance
- Foreign key constraints

See [database/schema.sql](database/schema.sql) for full schema.

## 📖 Documentation

1. **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
2. **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Detailed architecture and development guide
3. **[database/schema.sql](database/schema.sql)** - Database schema with sample data
4. **API Docs** - http://localhost:8000/docs (auto-generated Swagger)

## 🚀 Getting Started

### Prerequisites
- **Node.js 16+** and npm
- **Python 3.8+**
- **MySQL 8.0+**

### Setup Steps

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

Or follow these quick steps:

```bash
# 1. Setup Database
mysql -u root -p < database/schema.sql

# 2. Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Update .env with your MySQL credentials
python -m uvicorn app.main:app --reload

# 3. Setup Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

3. Open http://localhost:3000 in your browser

## 📝 Sample Data

The database schema includes sample data:
- **Admin user**: username=`admin`, password=`admin123`
- **3 classes**: 12A1, 12A2, 12B1
- **5 subjects**: Math, Physics, Chemistry, English, History

## 🔐 Default Credentials

Login with these credentials:
```
Username: admin
Password: admin123
```

Accounts are issued by the school or system administrator.

## 🧪 Testing the API

### Using Swagger UI
1. Start the backend server
2. Visit http://localhost:8000/docs
3. Click "Authorize" and use any valid token
4. Test endpoints interactively

### Using cURL
```bash
# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get students (replace TOKEN with value from login response)
curl -X GET "http://localhost:8000/api/v1/students" \
  -H "Authorization: Bearer TOKEN"
```

## 🎨 Frontend Development

### Available Components
- **Navbar**: Navigation and user menu
- **Sidebar**: Navigation menu
- **StudentForm**: Form for adding/editing students
- **Login**: Authentication page
- **Dashboard**: Statistics and quick actions
- **StudentPage**: Student listing and management

### Custom Hooks
- `useAuth()`: Authentication context
- `useLocalStorage()`: Local storage management
- `useFetch()`: Data fetching

### Service Classes
- `StudentService`: Student API calls
- `ClassService`: Class API calls
- `SubjectService`: Subject API calls
- `ScoreService`: Score API calls
- `AuthService`: Authentication API calls

## 🔄 State Management

Uses **React Context API** with **AuthContext** for:
- Current user information
- Login/logout state
- Role-based rendering
- Token management

## 📱 Responsive Design

All pages are responsive and work on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🚢 Production Deployment

### Backend
1. Set `DEBUG=False` in `.env`
2. Use strong `SECRET_KEY`
3. Configure production database
4. Set `CORS` allowed origins
5. Use HTTPS

### Frontend
1. Build: `npm run build`
2. Serve from `dist/` folder
3. Configure backend URL

## 🐛 Troubleshooting

See [QUICK_START.md](QUICK_START.md#troubleshooting) for common issues and solutions.

## 📚 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## 🤝 Contributing

To contribute:
1. Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
2. Follow the layered architecture
3. Add tests for new features
4. Submit pull requests

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Project Status

**Version**: 1.0.0  
**Status**: Active Development

### Future Enhancements
- [ ] Advanced reporting and analytics
- [ ] File upload for documents
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Pagination optimization
- [ ] Caching layer
- [ ] Expand automated test coverage
- [ ] Docker containerization

---

**Created**: April 2026  
**Last Updated**: April 29, 2026

For questions or issues, refer to [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
