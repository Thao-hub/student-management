-- Student Management System Database Schema
-- MySQL 8.0+
-- A more complete academic schema with:
-- users, permissions, teachers, rooms, academic terms,
-- curriculum assignments, enrollments, schedules, scores, and attendance.

CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS class_schedule;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS subject_teacher;
DROP TABLE IF EXISTS class_subject;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS academic_terms;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- AUTHENTICATION AND AUTHORIZATION
-- =========================================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    module_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role, permission_id),
    INDEX idx_role_permissions_role (role)
);

-- =========================================================
-- MASTER DATA
-- =========================================================

CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL UNIQUE,
    teacher_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    qualification VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_teachers_code (teacher_code),
    INDEX idx_teachers_email (email)
);

CREATE TABLE academic_terms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester_no TINYINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_term (academic_year, semester_no),
    CONSTRAINT chk_term_dates CHECK (start_date <= end_date)
);

CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_code VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(100),
    floor_no INT,
    capacity INT,
    room_type ENUM('classroom', 'lab', 'office', 'hall') NOT NULL DEFAULT 'classroom',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    grade_level VARCHAR(20),
    description TEXT,
    academic_year VARCHAR(20),
    homeroom_teacher_id INT NULL,
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    INDEX idx_classes_homeroom_teacher (homeroom_teacher_id)
);

CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    credits INT NOT NULL DEFAULT 3,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL UNIQUE,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    address TEXT,
    class_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(20),
    status ENUM('Active', 'Inactive', 'Graduated', 'Suspended') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    INDEX idx_students_code (student_code),
    INDEX idx_students_email (email),
    INDEX idx_students_class (class_id),
    INDEX idx_students_status (status)
);

-- =========================================================
-- ACADEMIC STRUCTURE
-- =========================================================

-- Which subjects are assigned to a class in a specific term
CREATE TABLE class_subject (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_term_id INT NOT NULL,
    credits_override INT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_term_id) REFERENCES academic_terms(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_class_subject_term (class_id, subject_id, academic_term_id),
    INDEX idx_class_subject_class (class_id),
    INDEX idx_class_subject_subject (subject_id),
    INDEX idx_class_subject_term (academic_term_id)
);

-- Which teacher teaches which class-subject in a specific term
CREATE TABLE subject_teacher (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    assigned_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_subject_id) REFERENCES class_subject(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subject_teacher (class_subject_id, teacher_id),
    INDEX idx_subject_teacher_teacher (teacher_id)
);

-- Student enrollment by subject and term
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_subject_id INT NOT NULL,
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('enrolled', 'dropped', 'completed', 'failed') NOT NULL DEFAULT 'enrolled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_subject_id) REFERENCES class_subject(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, class_subject_id),
    UNIQUE KEY unique_enrollment_id_class_subject (id, class_subject_id),
    INDEX idx_enrollments_student (student_id),
    INDEX idx_enrollments_class_subject (class_subject_id),
    INDEX idx_enrollments_status (status)
);

-- Weekly schedule for each class-subject
CREATE TABLE class_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    room_id INT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lesson_no TINYINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_subject_id) REFERENCES class_subject(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (class_subject_id, teacher_id) REFERENCES subject_teacher(class_subject_id, teacher_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_class_schedule_id_class_subject (id, class_subject_id),
    INDEX idx_class_schedule_class_subject (class_subject_id),
    INDEX idx_class_schedule_teacher (teacher_id),
    INDEX idx_class_schedule_room (room_id),
    CONSTRAINT chk_schedule_time CHECK (start_time < end_time)
);

-- Detailed scores for each enrollment
CREATE TABLE scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    score_type ENUM('Quiz', 'Assignment', 'Midterm', 'Final', 'Practice') NOT NULL,
    score DECIMAL(5, 2) NOT NULL,
    max_score DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    weight DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    grade VARCHAR(5),
    exam_date DATE,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    INDEX idx_scores_enrollment (enrollment_id),
    INDEX idx_scores_exam_date (exam_date),
    UNIQUE KEY unique_score_component (enrollment_id, score_type, exam_date),
    CONSTRAINT chk_score_range CHECK (score >= 0 AND max_score > 0 AND score <= max_score)
);

-- Attendance by schedule session and enrollment
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    class_schedule_id INT NOT NULL,
    class_subject_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL DEFAULT 'Present',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id, class_subject_id) REFERENCES enrollments(id, class_subject_id) ON DELETE CASCADE,
    FOREIGN KEY (class_schedule_id, class_subject_id) REFERENCES class_schedule(id, class_subject_id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (enrollment_id, class_schedule_id, attendance_date),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_schedule (class_schedule_id),
    INDEX idx_attendance_class_subject (class_subject_id)
);

-- =========================================================
-- SEED DATA
-- =========================================================

INSERT INTO permissions (code, name, description, module_name) VALUES
('dashboard.view', 'View dashboard', 'Can view dashboard metrics', 'dashboard'),
('students.view', 'View students', 'Can read student records', 'students'),
('students.create', 'Create students', 'Can create student records', 'students'),
('students.update', 'Update students', 'Can edit student records', 'students'),
('students.delete', 'Delete students', 'Can delete student records', 'students'),
('scores.view', 'View scores', 'Can read score records', 'scores'),
('scores.update', 'Update scores', 'Can enter and update scores', 'scores'),
('schedule.view', 'View schedule', 'Can read class schedule', 'schedule');

INSERT INTO role_permissions (role, permission_id) VALUES
('admin', 1), ('admin', 2), ('admin', 3), ('admin', 4), ('admin', 5), ('admin', 6), ('admin', 7), ('admin', 8),
('teacher', 1), ('teacher', 2), ('teacher', 4), ('teacher', 6), ('teacher', 7), ('teacher', 8),
('student', 1), ('student', 2), ('student', 6), ('student', 8);

INSERT INTO users (username, email, hashed_password, role) VALUES
('admin', 'admin@example.com', '$2b$12$YpNlhpz7uqndQas2EnJgWuzhsKu7nj.CMwAT9oqXLNc1LrzDPCitG', 'admin'),
('teacher_nguyen', 'nguyent@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'teacher'),
('teacher_hoang', 'hoangh@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'teacher'),
('teacher_tran', 'trant@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'teacher'),
('student_s2025001', 'nguyenvana@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'student'),
('student_s2025002', 'tranthib@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'student'),
('student_s2025009', 'voquoci@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'student');

INSERT INTO teachers (user_id, teacher_code, first_name, last_name, email, phone, qualification, department, hire_date) VALUES
(2, 'T001', 'Nguyen', 'Minh Chau', 'nguyent@school.edu', '0961234567', 'M.Sc Mathematics', 'Science', '2020-08-01'),
(3, 'T002', 'Hoang', 'Thu Ha', 'hoangh@school.edu', '0962234567', 'M.Sc Physics', 'Science', '2021-08-01'),
(4, 'T003', 'Tran', 'Thanh Long', 'trant@school.edu', '0963234567', 'M.A English Literature', 'Languages', '2019-08-01');

INSERT INTO academic_terms (name, academic_year, semester_no, start_date, end_date, is_current) VALUES
('Semester 1 2024-2025', '2024-2025', 1, '2024-08-15', '2024-12-31', TRUE),
('Semester 2 2024-2025', '2024-2025', 2, '2025-01-05', '2025-05-31', FALSE);

INSERT INTO rooms (room_code, building, floor_no, capacity, room_type) VALUES
('A101', 'Building A', 1, 45, 'classroom'),
('A102', 'Building A', 1, 45, 'classroom'),
('A103', 'Building A', 1, 40, 'classroom'),
('LAB201', 'Building B', 2, 35, 'lab');

INSERT INTO classes (name, grade_level, description, academic_year, homeroom_teacher_id, capacity) VALUES
('10A1', '10', 'Science and Technology focus', '2024-2025', 1, 40),
('10A2', '10', 'Mathematics focus', '2024-2025', 2, 40),
('11B1', '11', 'Literature and Social Science focus', '2024-2025', 3, 38),
('11B2', '11', 'Natural Science focus', '2024-2025', 1, 38);

INSERT INTO subjects (name, code, credits, description) VALUES
('Mathematics', 'MATH101', 4, 'Algebra, geometry and calculus fundamentals'),
('Physics', 'PHYS101', 4, 'Mechanics, electricity and thermal physics'),
('Chemistry', 'CHEM101', 4, 'Chemical reactions and laboratory skills'),
('English', 'ENG101', 3, 'Academic English and reading comprehension'),
('History', 'HIST101', 2, 'World history and historical analysis'),
('Computer Science', 'CS101', 4, 'Introduction to programming and algorithms');

INSERT INTO students (
    user_id, student_code, first_name, last_name, email, phone, date_of_birth,
    gender, address, class_id, enrollment_date, guardian_name, guardian_phone, status
) VALUES
(5, 'S2025001', 'Nguyen', 'Van A', 'nguyenvana@example.com', '0912345678', '2008-02-15', 'Male', '123 Le Loi, District 1, Ho Chi Minh City', 1, '2024-08-15', 'Nguyen Van Senior', '0901000001', 'Active'),
(6, 'S2025002', 'Tran', 'Thi B', 'tranthib@example.com', '0905123456', '2008-06-03', 'Female', '45 Nguyen Hue, District 1, Ho Chi Minh City', 1, '2024-08-15', 'Tran Thi Senior', '0901000002', 'Active'),
(NULL, 'S2025003', 'Le', 'Minh C', 'leminhc@example.com', '0934567890', '2007-11-08', 'Male', '78 Pasteur, District 3, Ho Chi Minh City', 1, '2024-08-15', 'Le Minh Parent', '0901000003', 'Active'),
(NULL, 'S2025004', 'Pham', 'Thi D', 'phamthid@example.com', '0987654321', '2008-01-20', 'Female', '12 Tran Hung Dao, District 5, Ho Chi Minh City', 1, '2024-08-15', 'Pham Thi Parent', '0901000004', 'Active'),
(NULL, 'S2025005', 'Hoang', 'Van E', 'hoangvane@example.com', '0911223344', '2008-04-10', 'Male', '89 Vo Van Tan, District 3, Ho Chi Minh City', 2, '2024-08-15', 'Hoang Van Parent', '0901000005', 'Active'),
(NULL, 'S2025006', 'Bui', 'Thi F', 'buithif@example.com', '0902233445', '2007-12-25', 'Female', '56 Ton That Thuyet, District 4, Ho Chi Minh City', 2, '2024-08-15', 'Bui Thi Parent', '0901000006', 'Active'),
(7, 'S2025009', 'Vo', 'Quoc I', 'voquoci@example.com', '0941122334', '2007-09-12', 'Male', '14 Hai Ba Trung, District 1, Ho Chi Minh City', 3, '2023-08-16', 'Vo Quoc Parent', '0901000009', 'Active'),
(NULL, 'S2025010', 'Tran', 'Van J', 'tranvanj@example.com', '0911778899', '2007-05-29', 'Male', '39 Nguyen Du, District 1, Ho Chi Minh City', 3, '2023-08-16', 'Tran Van Parent', '0901000010', 'Active');

INSERT INTO class_subject (class_id, subject_id, academic_term_id, is_required) VALUES
(1, 1, 1, TRUE),
(1, 2, 1, TRUE),
(1, 4, 1, TRUE),
(1, 6, 1, TRUE),
(2, 1, 1, TRUE),
(2, 2, 1, TRUE),
(2, 3, 1, TRUE),
(2, 4, 1, TRUE),
(3, 4, 1, TRUE),
(3, 5, 1, TRUE),
(3, 6, 1, TRUE),
(4, 1, 1, TRUE),
(4, 2, 1, TRUE),
(4, 3, 1, TRUE);

INSERT INTO subject_teacher (class_subject_id, teacher_id, assigned_at) VALUES
(1, 1, '2024-08-10'),
(2, 2, '2024-08-10'),
(3, 3, '2024-08-10'),
(4, 1, '2024-08-10'),
(5, 1, '2024-08-10'),
(6, 2, '2024-08-10'),
(8, 3, '2024-08-10'),
(9, 3, '2024-08-10'),
(10, 3, '2024-08-10'),
(11, 1, '2024-08-10');

INSERT INTO enrollments (student_id, class_subject_id, status, notes) VALUES
(1, 1, 'enrolled', NULL),
(1, 2, 'enrolled', NULL),
(1, 3, 'enrolled', NULL),
(2, 1, 'enrolled', NULL),
(2, 3, 'enrolled', NULL),
(3, 1, 'enrolled', NULL),
(3, 4, 'enrolled', NULL),
(4, 2, 'enrolled', NULL),
(5, 5, 'enrolled', NULL),
(5, 6, 'enrolled', NULL),
(6, 6, 'enrolled', NULL),
(7, 9, 'enrolled', NULL),
(7, 10, 'enrolled', NULL),
(8, 9, 'enrolled', NULL);

INSERT INTO class_schedule (class_subject_id, teacher_id, room_id, day_of_week, start_time, end_time, lesson_no) VALUES
(1, 1, 1, 'Monday', '07:00:00', '08:30:00', 1),
(1, 1, 1, 'Wednesday', '07:00:00', '08:30:00', 2),
(2, 2, 2, 'Tuesday', '08:45:00', '10:15:00', 3),
(3, 3, 3, 'Friday', '13:00:00', '14:30:00', 4),
(5, 1, 1, 'Monday', '10:30:00', '12:00:00', 5),
(6, 2, 2, 'Thursday', '08:45:00', '10:15:00', 6),
(9, 3, 3, 'Tuesday', '07:00:00', '08:30:00', 1),
(10, 3, 3, 'Thursday', '07:00:00', '08:30:00', 2);

INSERT INTO scores (enrollment_id, score_type, score, max_score, weight, grade, exam_date, remarks) VALUES
(1, 'Midterm', 8.5, 10.0, 0.4, 'B+', '2024-10-18', NULL),
(1, 'Final', 9.1, 10.0, 0.6, 'A', '2024-12-18', NULL),
(2, 'Final', 7.9, 10.0, 1.0, 'B', '2024-12-20', NULL),
(3, 'Quiz', 8.8, 10.0, 0.2, 'A-', '2024-10-22', NULL),
(4, 'Final', 6.7, 10.0, 1.0, 'C+', '2024-12-18', NULL),
(5, 'Final', 8.2, 10.0, 1.0, 'B+', '2024-12-22', NULL),
(6, 'Final', 9.3, 10.0, 1.0, 'A', '2024-12-18', NULL),
(7, 'Assignment', 8.9, 10.0, 0.3, 'A', '2024-11-05', 'Project work'),
(8, 'Final', 7.4, 10.0, 1.0, 'B', '2024-12-20', NULL),
(9, 'Final', 8.8, 10.0, 1.0, 'A-', '2024-12-18', NULL),
(12, 'Final', 8.2, 10.0, 1.0, 'B+', '2024-12-19', NULL),
(13, 'Final', 8.0, 10.0, 1.0, 'B', '2024-12-21', NULL);

INSERT INTO attendance (enrollment_id, class_schedule_id, class_subject_id, attendance_date, status, notes) VALUES
(1, 1, 1, '2024-10-16', 'Present', NULL),
(1, 2, 1, '2024-10-18', 'Present', NULL),
(2, 3, 2, '2024-10-17', 'Late', 'Traffic jam'),
(3, 4, 3, '2024-10-18', 'Present', NULL),
(4, 1, 1, '2024-10-16', 'Absent', 'Sick'),
(5, 4, 3, '2024-10-18', 'Present', NULL),
(6, 1, 1, '2024-10-16', 'Present', NULL),
(7, 4, 4, '2024-10-18', 'Present', NULL),
(8, 3, 2, '2024-10-17', 'Excused', 'Doctor appointment'),
(9, 5, 5, '2024-10-16', 'Present', NULL),
(10, 6, 6, '2024-10-17', 'Late', 'Overslept'),
(12, 7, 9, '2024-10-17', 'Present', NULL),
(13, 8, 10, '2024-10-17', 'Present', NULL),
(14, 7, 9, '2024-10-17', 'Excused', 'School event');
