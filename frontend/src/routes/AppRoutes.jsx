import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import StudentPage from '../pages/StudentPage';
import ClassPage from '../pages/ClassPage';
import SubjectPage from '../pages/SubjectPage';
import ScorePage from '../pages/ScorePage';
import StudentDetailPage from '../pages/StudentDetailPage';
import ClassDetailPage from '../pages/ClassDetailPage';
import SubjectDetailPage from '../pages/SubjectDetailPage';
import ScoreDetailPage from '../pages/ScoreDetailPage';
import ClassSubjectPage from '../pages/ClassSubjectPage';
import TeacherList from '../pages/TeacherList';
import AcademicTermPage from '../pages/AcademicTermPage';
import RoomPage from '../pages/RoomPage';
import SchedulePage from '../pages/SchedulePage';
import EnrollmentPage from '../pages/EnrollmentPage';
import AttendancePage from '../pages/AttendancePage';
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:studentId"
          element={
            <ProtectedRoute>
              <StudentDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <ClassPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/classes/:classId"
          element={
            <ProtectedRoute>
              <ClassDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <SubjectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects/:subjectId"
          element={
            <ProtectedRoute>
              <SubjectDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/class-subjects"
          element={
            <ProtectedRoute>
              <ClassSubjectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/class-subjects/create"
          element={
            <ProtectedRoute>
              <ClassSubjectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/class-subjects/edit/:classSubjectId"
          element={
            <ProtectedRoute>
              <ClassSubjectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scores"
          element={
            <ProtectedRoute>
              <ScorePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scores/:scoreId"
          element={
            <ProtectedRoute>
              <ScoreDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/terms"
          element={
            <ProtectedRoute>
              <AcademicTermPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms/create"
          element={
            <ProtectedRoute>
              <AcademicTermPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms/edit/:termId"
          element={
            <ProtectedRoute>
              <AcademicTermPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/create"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/edit/:roomId"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule/create"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule/edit/:scheduleId"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enrollments"
          element={
            <ProtectedRoute>
              <EnrollmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments/create"
          element={
            <ProtectedRoute>
              <EnrollmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments/edit/:enrollmentId"
          element={
            <ProtectedRoute>
              <EnrollmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/create"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/edit/:attendanceId"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <TeacherList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers/create"
          element={
            <ProtectedRoute>
              <TeacherList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers/edit/:id"
          element={
            <ProtectedRoute>
              <TeacherList />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
