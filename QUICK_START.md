# Quick Start Guide

## Prerequisites

- **Node.js 16+** and **npm** (for frontend)
- **Python 3.8+** (for backend)
- **MySQL 8.0+** (for database)

## 5-Minute Setup

### 1. Database Setup

```bash
# Import the SQL schema
mysql -u root -p < database/schema.sql

# Default credentials (change in production):
# Username: root
# Database: student_management
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Update .env file with your MySQL credentials
# Then run the server
python -m uvicorn app.main:app --reload
```

Backend running at: **http://localhost:8000**
API Documentation: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

App running at: **http://localhost:3000**

## Test Authentication

### Default Admin Account (from database setup)
- **Username**: admin
- **Password**: admin123
- **Role**: admin

### Create Test Accounts
1. Click "Register here" on login page
2. Enter username, email, password
3. Select role (student, teacher, admin)
4. Click Register

## What's Included

✅ **Complete Database Schema**
- Users with role-based access
- Classes, Subjects, Students, Scores
- Proper relationships and constraints

✅ **Backend API** (FastAPI)
- 5 RESTful resource endpoints
- JWT authentication
- Role-based authorization
- Automatic API documentation

✅ **Frontend UI** (React + Vite)
- Login/Registration page
- Dashboard with statistics
- Student management interface
- Responsive design

## Key Features

- **Authentication**: Secure JWT-based login
- **Authorization**: Role-based access control (Admin, Teacher, Student)
- **Validation**: Input validation on both frontend and backend
- **Database**: Normalized MySQL schema with relationships
- **API**: Auto-documented with Swagger/OpenAPI
- **UI**: Clean, responsive interface

## Project Structure

```
student_management/
├── frontend/              # React + Vite app
├── backend/               # FastAPI application
├── database/              # MySQL schema
├── docs/                  # Documentation
├── README.md             # Project overview
├── DEVELOPER_GUIDE.md    # Detailed guide
└── QUICK_START.md        # This file
```

## Common Commands

### Backend
```bash
# Start server with auto-reload
python -m uvicorn app.main:app --reload

# Start production server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## API Examples

### Register
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student1@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Get Students
```bash
curl -X GET "http://localhost:8000/api/v1/students" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### MySQL Connection Error
```bash
# Check if MySQL is running
# On Windows:
mysql.exe -u root -p

# On macOS:
mysql -u root -p

# Connection string format:
mysql+pymysql://root:password@localhost:3306/student_management
```

### Port Already in Use
```bash
# Change frontend port in vite.config.js
# Change backend port:
python -m uvicorn app.main:app --reload --port 8001
```

### CORS Issues
Backend already has CORS enabled. If issues persist:
1. Check frontend is at http://localhost:3000
2. Check backend is at http://localhost:8000

### Token Issues
- Tokens expire after 30 minutes
- Clear browser storage: `localStorage.clear()`
- Re-login to get a new token

## Next Steps

1. **Explore API**: Visit http://localhost:8000/docs
2. **Test Features**: Create students, classes, and scores
3. **Customize**: Modify styles, add features
4. **Deploy**: Follow production deployment guide

## Environment Configuration

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/student_management
SECRET_KEY=change-this-to-a-random-string-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
APP_NAME=Student Management System
```

## Production Deployment

For production deployment:
1. Set `DEBUG=False` in backend .env
2. Use strong `SECRET_KEY` value
3. Update CORS allowed origins
4. Use environment-specific .env files
5. Enable HTTPS
6. Set proper database credentials

## Support & Documentation

- **Developer Guide**: See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Project Overview**: See [README.md](README.md)
- **Database Schema**: See [database/schema.sql](database/schema.sql)
- **API Docs**: http://localhost:8000/docs (when server running)

---

**Having issues?** Check the troubleshooting section or review the detailed developer guide.
