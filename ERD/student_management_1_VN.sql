-- Student Management System Database Schema (Tieng Viet khong dau)

CREATE DATABASE IF NOT EXISTS quan_ly_sinh_vien;
USE quan_ly_sinh_vien;

-- Bang lop
CREATE TABLE lop (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_lop VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bang mon hoc
CREATE TABLE mon_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_mon VARCHAR(100) NOT NULL UNIQUE,
    ma_mon VARCHAR(50) NOT NULL UNIQUE,
    so_tin_chi INT DEFAULT 3,
    mo_ta TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bang sinh vien
CREATE TABLE sinh_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_sinh_vien VARCHAR(50) NOT NULL UNIQUE,
    ten VARCHAR(100) NOT NULL,
    ho VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    ngay_sinh DATE,
    gioi_tinh ENUM('nam', 'nu', 'khac'),
    dia_chi TEXT,
    lop_id INT NOT NULL,
    ngay_nhap_hoc DATE NOT NULL,
    trang_thai ENUM('dang_hoc', 'nghi_hoc', 'tot_nghiep') DEFAULT 'dang_hoc',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lop_id) REFERENCES lop(id) ON DELETE CASCADE,
    INDEX idx_ma_sinh_vien (ma_sinh_vien),
    INDEX idx_email (email),
    INDEX idx_lop_id (lop_id)
);

-- Bang diem
CREATE TABLE diem (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sinh_vien_id INT NOT NULL,
    mon_hoc_id INT NOT NULL,
    diem DECIMAL(5,2) NOT NULL,
    xep_loai VARCHAR(5),
    ngay_thi DATE,
    loai_thi ENUM('giua_ky', 'cuoi_ky', 'kiem_tra') DEFAULT 'cuoi_ky',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_hoc_id) REFERENCES mon_hoc(id) ON DELETE CASCADE,
    INDEX idx_sinh_vien_id (sinh_vien_id),
    INDEX idx_mon_hoc_id (mon_hoc_id),
    UNIQUE KEY unique_diem (sinh_vien_id, mon_hoc_id, loai_thi)
);

-- Bang nguoi dung
CREATE TABLE nguoi_dung (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_dang_nhap VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mat_khau_ma_hoa VARCHAR(255) NOT NULL,
    vai_tro ENUM('admin', 'giao_vien', 'sinh_vien') DEFAULT 'sinh_vien',
    hoat_dong BOOLEAN DEFAULT TRUE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ten_dang_nhap (ten_dang_nhap),
    INDEX idx_email (email)
);

-- Du lieu mau
INSERT INTO lop (ten_lop, mo_ta) VALUES
('12A1', 'lop 12A1 - khoi tu nhien'),
('12A2', 'lop 12A2 - khoi tu nhien'),
('12B1', 'lop 12B1 - khoi xa hoi');

INSERT INTO mon_hoc (ten_mon, ma_mon, so_tin_chi, mo_ta) VALUES
('toan hoc', 'TOAN101', 4, 'toan nang cao'),
('vat ly', 'LY101', 4, 'vat ly co ban'),
('hoa hoc', 'HOA101', 4, 'hoa huu co'),
('tieng anh', 'ANH101', 3, 'ngon ngu anh'),
('lich su', 'SU101', 2, 'lich su the gioi');

INSERT INTO nguoi_dung (ten_dang_nhap, email, mat_khau_ma_hoa, vai_tro) VALUES
('admin', 'admin@example.com', '$2b$12$7J7Z7Z7Z7Z7Z7Z7Z7Z7Z7e', 'admin'),
('giaovien1', 'teacher1@example.com', '$2b$12$7J7Z7Z7Z7Z7Z7Z7Z7Z7e', 'giao_vien'),
('sinhvien1', 'student1@example.com', '$2b$12$7J7Z7Z7Z7Z7Z7Z7Z7Z7e', 'sinh_vien');