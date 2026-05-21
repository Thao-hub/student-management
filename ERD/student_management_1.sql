-- Student Management System Database Schema

CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- Classes table
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    credits INT DEFAULT 3,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    address TEXT,
    class_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'Graduated') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_class_id (class_id)
);

-- Scores table
CREATE TABLE scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    score DECIMAL(5, 2) NOT NULL,
    grade VARCHAR(5),
    exam_date DATE,
    exam_type ENUM('Midterm', 'Final', 'Quiz') DEFAULT 'Final',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_subject_id (subject_id),
    UNIQUE KEY unique_score (student_id, subject_id, exam_type)
);

-- Users table (for authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Sample data
INSERT INTO classes (name, description) VALUES
('12A1', 'Class 12A1 - Science stream'),
('12A2', 'Class 12A2 - Science stream'),
('12B1', 'Class 12B1 - Literature stream');

INSERT INTO subjects (name, code, credits, description) VALUES
('Mathematics', 'MATH101', 4, 'Advanced Mathematics'),
('Physics', 'PHYS101', 4, 'General Physics'),
('Chemistry', 'CHEM101', 4, 'Organic Chemistry'),
('English', 'ENG101', 3, 'English Language and Literature'),
('History', 'HIST101', 2, 'World History');

INSERT INTO users (username, email, hashed_password, role) VALUES
('admin', 'admin@example.com', '$2b$12$7J7Z7Z7Z7Z7Z7Z7Z7Z7Z7e', 'admin'),
('teacher1', 'teacher1@example.com', '$2b$12$7J7Z7Z7Z7Z7Z7Z7Z7Z7Z7e', 'teacher'),
('student1', 'student1@example.com', '$2b$12$7J7Z7Z7Z7Z7Z7Z7Z7Z7Z7e', 'student');
