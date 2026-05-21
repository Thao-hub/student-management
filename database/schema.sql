-- Luoc do co so du lieu he thong quan ly sinh vien
-- Ban tinh gon
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS qlsv;
USE qlsv;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS diem_danh;
DROP TABLE IF EXISTS diem_so;
DROP TABLE IF EXISTS lich_hoc;
DROP TABLE IF EXISTS dang_ky_hoc;
DROP TABLE IF EXISTS lop_mon_hoc;
DROP TABLE IF EXISTS sinh_vien;
DROP TABLE IF EXISTS giao_vien;
DROP TABLE IF EXISTS mon_hoc;
DROP TABLE IF EXISTS lop_hoc;
DROP TABLE IF EXISTS phong_hoc;
DROP TABLE IF EXISTS hoc_ky;
DROP TABLE IF EXISTS tai_khoan;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- TAI KHOAN
-- =========================================================

CREATE TABLE tai_khoan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_dang_nhap VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mat_khau_ma_hoa VARCHAR(255) NOT NULL,
    vai_tro ENUM('quan_tri', 'giao_vien', 'sinh_vien') NOT NULL DEFAULT 'sinh_vien',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- DANH MUC CO BAN
-- =========================================================

CREATE TABLE giao_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tai_khoan_id INT NULL UNIQUE,
    ma_giao_vien VARCHAR(50) NOT NULL UNIQUE,
    ho VARCHAR(100) NOT NULL,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    trinh_do VARCHAR(100),
    ngay_vao_lam DATE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL
);

CREATE TABLE hoc_ky (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_hoc_ky VARCHAR(100) NOT NULL,
    nam_hoc VARCHAR(20) NOT NULL,
    so_hoc_ky TINYINT NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    trang_thai ENUM('du_kien', 'dang_dien_ra', 'da_ket_thuc') NOT NULL DEFAULT 'du_kien',
    UNIQUE KEY unique_hoc_ky (nam_hoc, so_hoc_ky),
    CONSTRAINT chk_hoc_ky_ngay CHECK (ngay_bat_dau <= ngay_ket_thuc)
);

CREATE TABLE phong_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_phong VARCHAR(50) NOT NULL UNIQUE,
    toa_nha VARCHAR(100),
    tang INT,
    suc_chua INT,
    loai_phong ENUM('phong_hoc', 'phong_lab') NOT NULL DEFAULT 'phong_hoc',
    CONSTRAINT chk_phong_hoc_suc_chua CHECK (suc_chua IS NULL OR suc_chua > 0)
);

CREATE TABLE lop_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_lop VARCHAR(100) NOT NULL,
    khoi_lop VARCHAR(20),
    nam_hoc VARCHAR(20),
    giao_vien_chu_nhiem_id INT NULL,
    si_so_toi_da INT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (giao_vien_chu_nhiem_id) REFERENCES giao_vien(id) ON DELETE SET NULL,
    UNIQUE KEY unique_ten_lop_nam_hoc (ten_lop, nam_hoc),
    CONSTRAINT chk_lop_hoc_si_so CHECK (si_so_toi_da IS NULL OR si_so_toi_da > 0)
);

CREATE TABLE mon_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_mon VARCHAR(50) NOT NULL UNIQUE,
    ten_mon VARCHAR(100) NOT NULL UNIQUE,
    so_tin_chi INT NOT NULL DEFAULT 3,
    mo_ta TEXT,
    CONSTRAINT chk_mon_hoc_tin_chi CHECK (so_tin_chi BETWEEN 1 AND 10)
);

-- =========================================================
-- NGUOI HOC
-- =========================================================

CREATE TABLE sinh_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tai_khoan_id INT NULL UNIQUE,
    ma_sinh_vien VARCHAR(50) NOT NULL UNIQUE,
    ho VARCHAR(100) NOT NULL,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    ngay_sinh DATE,
    gioi_tinh ENUM('Nam', 'Nu', 'Khac'),
    dia_chi TEXT,
    lop_hoc_id INT NOT NULL,
    ngay_nhap_hoc DATE NOT NULL,
    ten_nguoi_giam_ho VARCHAR(150),
    so_dien_thoai_giam_ho VARCHAR(20),
    trang_thai ENUM('Dang_hoc', 'Bao_luu', 'Tot_nghiep', 'Tam_dung') NOT NULL DEFAULT 'Dang_hoc',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL,
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id) ON DELETE RESTRICT
);

-- =========================================================
-- GIANG DAY
-- =========================================================

CREATE TABLE lop_mon_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lop_hoc_id INT NOT NULL,
    mon_hoc_id INT NOT NULL,
    hoc_ky_id INT NOT NULL,
    giao_vien_id INT NULL,
    ngay_phan_cong DATE,
    bat_buoc BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_hoc_id) REFERENCES mon_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (hoc_ky_id) REFERENCES hoc_ky(id) ON DELETE RESTRICT,
    FOREIGN KEY (giao_vien_id) REFERENCES giao_vien(id) ON DELETE SET NULL,
    UNIQUE KEY unique_lop_mon_hoc_hoc_ky (lop_hoc_id, mon_hoc_id, hoc_ky_id)
);

CREATE TABLE dang_ky_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sinh_vien_id INT NOT NULL,
    lop_mon_hoc_id INT NOT NULL,
    ngay_dang_ky DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('dang_hoc', 'rut_mon', 'hoan_thanh', 'khong_dat') NOT NULL DEFAULT 'dang_hoc',
    ghi_chu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id) ON DELETE CASCADE,
    FOREIGN KEY (lop_mon_hoc_id) REFERENCES lop_mon_hoc(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dang_ky_hoc (sinh_vien_id, lop_mon_hoc_id),
    INDEX idx_dang_ky_hoc_id_lop_mon_hoc (id, lop_mon_hoc_id)
);

CREATE TABLE lich_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lop_mon_hoc_id INT NOT NULL,
    phong_hoc_id INT NULL,
    thu_trong_tuan ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    tiet_hoc TINYINT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lop_mon_hoc_id) REFERENCES lop_mon_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (phong_hoc_id) REFERENCES phong_hoc(id) ON DELETE SET NULL,
    INDEX idx_lich_hoc_id_lop_mon_hoc (id, lop_mon_hoc_id),
    CONSTRAINT chk_lich_hoc_gio CHECK (gio_bat_dau < gio_ket_thuc)
);

-- =========================================================
-- DIEM VA DIEM DANH
-- =========================================================

CREATE TABLE diem_so (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dang_ky_hoc_id INT NOT NULL,
    loai_diem ENUM('Quiz', 'Assignment', 'Midterm', 'Final', 'Practice') NOT NULL,
    diem DECIMAL(5, 2) NOT NULL,
    diem_toi_da DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    trong_so DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    ngay_kiem_tra DATE,
    nhan_xet VARCHAR(255),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dang_ky_hoc_id) REFERENCES dang_ky_hoc(id) ON DELETE CASCADE,
    UNIQUE KEY unique_thanh_phan_diem (dang_ky_hoc_id, loai_diem, ngay_kiem_tra),
    CONSTRAINT chk_diem_so_hop_le CHECK (diem >= 0 AND diem_toi_da > 0 AND diem <= diem_toi_da),
    CONSTRAINT chk_diem_so_trong_so CHECK (trong_so >= 0 AND trong_so <= 1)
);

CREATE TABLE diem_danh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dang_ky_hoc_id INT NOT NULL,
    lich_hoc_id INT NOT NULL,
    lop_mon_hoc_id INT NOT NULL,
    ngay_diem_danh DATE NOT NULL,
    trang_thai ENUM('Co_mat', 'Vang', 'Tre', 'Co_phep') NOT NULL DEFAULT 'Co_mat',
    ghi_chu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dang_ky_hoc_id, lop_mon_hoc_id) REFERENCES dang_ky_hoc(id, lop_mon_hoc_id) ON DELETE CASCADE,
    FOREIGN KEY (lich_hoc_id, lop_mon_hoc_id) REFERENCES lich_hoc(id, lop_mon_hoc_id) ON DELETE CASCADE,
    UNIQUE KEY unique_diem_danh (dang_ky_hoc_id, lich_hoc_id, ngay_diem_danh)
);

-- =========================================================
-- DU LIEU MAU
-- =========================================================

INSERT INTO tai_khoan (ten_dang_nhap, email, mat_khau_ma_hoa, vai_tro) VALUES
('admin', 'admin@example.com', '$2b$12$YpNlhpz7uqndQas2EnJgWuzhsKu7nj.CMwAT9oqXLNc1LrzDPCitG', 'quan_tri'),
('teacher_nguyen', 'nguyent@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'giao_vien'),
('teacher_hoang', 'hoangh@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'giao_vien'),
('teacher_tran', 'trant@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'giao_vien'),
('student_s2025001', 'nguyenvana@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'sinh_vien'),
('student_s2025002', 'tranthib@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'sinh_vien'),
('student_s2025009', 'voquoci@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'sinh_vien');

INSERT INTO giao_vien (tai_khoan_id, ma_giao_vien, ho, ten, email, so_dien_thoai, trinh_do, ngay_vao_lam) VALUES
(2, 'T001', 'Nguyen', 'Minh Chau', 'nguyent@school.edu', '0961234567', 'M.Sc Mathematics', '2020-08-01'),
(3, 'T002', 'Hoang', 'Thu Ha', 'hoangh@school.edu', '0962234567', 'M.Sc Physics', '2021-08-01'),
(4, 'T003', 'Tran', 'Thanh Long', 'trant@school.edu', '0963234567', 'M.A English Literature', '2019-08-01');

INSERT INTO hoc_ky (ten_hoc_ky, nam_hoc, so_hoc_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai) VALUES
('Hoc ky 1 2024-2025', '2024-2025', 1, '2024-08-15', '2024-12-31', 'dang_dien_ra'),
('Hoc ky 2 2024-2025', '2024-2025', 2, '2025-01-05', '2025-05-31', 'du_kien');

INSERT INTO phong_hoc (ma_phong, toa_nha, tang, suc_chua, loai_phong) VALUES
('A101', 'Toa A', 1, 45, 'phong_hoc'),
('A102', 'Toa A', 1, 45, 'phong_hoc'),
('A103', 'Toa A', 1, 40, 'phong_hoc'),
('LAB201', 'Toa B', 2, 35, 'phong_lab');

INSERT INTO lop_hoc (ten_lop, khoi_lop, nam_hoc, giao_vien_chu_nhiem_id, si_so_toi_da) VALUES
('10A1', '10', '2024-2025', 1, 40),
('10A2', '10', '2024-2025', 2, 40),
('11B1', '11', '2024-2025', 3, 38);

INSERT INTO mon_hoc (ma_mon, ten_mon, so_tin_chi, mo_ta) VALUES
('MATH101', 'Toan hoc', 4, 'Dai so, hinh hoc va giai tich co ban'),
('PHYS101', 'Vat ly', 4, 'Co hoc, dien hoc va nhiet hoc'),
('ENG101', 'Tieng Anh', 3, 'Tieng Anh hoc thuat va doc hieu'),
('CS101', 'Tin hoc', 4, 'Nhap mon lap trinh va thuat toan');

INSERT INTO sinh_vien (
    tai_khoan_id, ma_sinh_vien, ho, ten, email, so_dien_thoai, ngay_sinh,
    gioi_tinh, dia_chi, lop_hoc_id, ngay_nhap_hoc, ten_nguoi_giam_ho, so_dien_thoai_giam_ho, trang_thai
) VALUES
(5, 'S2025001', 'Nguyen', 'Van A', 'nguyenvana@example.com', '0912345678', '2008-02-15', 'Nam', '123 Le Loi, District 1, Ho Chi Minh City', 1, '2024-08-15', 'Nguyen Van Senior', '0901000001', 'Dang_hoc'),
(6, 'S2025002', 'Tran', 'Thi B', 'tranthib@example.com', '0905123456', '2008-06-03', 'Nu', '45 Nguyen Hue, District 1, Ho Chi Minh City', 1, '2024-08-15', 'Tran Thi Senior', '0901000002', 'Dang_hoc'),
(NULL, 'S2025003', 'Le', 'Minh C', 'leminhc@example.com', '0934567890', '2007-11-08', 'Nam', '78 Pasteur, District 3, Ho Chi Minh City', 1, '2024-08-15', 'Le Minh Parent', '0901000003', 'Dang_hoc'),
(7, 'S2025009', 'Vo', 'Quoc I', 'voquoci@example.com', '0941122334', '2007-09-12', 'Nam', '14 Hai Ba Trung, District 1, Ho Chi Minh City', 3, '2023-08-16', 'Vo Quoc Parent', '0901000009', 'Dang_hoc');

INSERT INTO lop_mon_hoc (lop_hoc_id, mon_hoc_id, hoc_ky_id, giao_vien_id, ngay_phan_cong, bat_buoc) VALUES
(1, 1, 1, 1, '2024-08-10', TRUE),
(1, 2, 1, 2, '2024-08-10', TRUE),
(1, 3, 1, 3, '2024-08-10', TRUE),
(1, 4, 1, 1, '2024-08-10', TRUE),
(2, 1, 1, 1, '2024-08-10', TRUE),
(2, 2, 1, 2, '2024-08-10', TRUE),
(3, 3, 1, 3, '2024-08-10', TRUE),
(3, 4, 1, 1, '2024-08-10', TRUE);

INSERT INTO dang_ky_hoc (sinh_vien_id, lop_mon_hoc_id, trang_thai, ghi_chu) VALUES
(1, 1, 'dang_hoc', NULL),
(1, 2, 'dang_hoc', NULL),
(1, 3, 'dang_hoc', NULL),
(2, 1, 'dang_hoc', NULL),
(2, 3, 'dang_hoc', NULL),
(3, 1, 'dang_hoc', NULL),
(3, 4, 'dang_hoc', NULL),
(4, 7, 'dang_hoc', NULL),
(4, 8, 'dang_hoc', NULL);

INSERT INTO lich_hoc (lop_mon_hoc_id, phong_hoc_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc, tiet_hoc) VALUES
(1, 1, 'Monday', '07:00:00', '08:30:00', 1),
(1, 1, 'Wednesday', '07:00:00', '08:30:00', 2),
(2, 2, 'Tuesday', '08:45:00', '10:15:00', 3),
(3, 3, 'Friday', '13:00:00', '14:30:00', 4),
(7, 3, 'Tuesday', '07:00:00', '08:30:00', 1),
(8, 4, 'Thursday', '07:00:00', '08:30:00', 2);

INSERT INTO diem_so (dang_ky_hoc_id, loai_diem, diem, diem_toi_da, trong_so, ngay_kiem_tra, nhan_xet) VALUES
(1, 'Midterm', 8.5, 10.0, 0.4, '2024-10-18', NULL),
(1, 'Final', 9.1, 10.0, 0.6, '2024-12-18', NULL),
(2, 'Final', 7.9, 10.0, 1.0, '2024-12-20', NULL),
(3, 'Quiz', 8.8, 10.0, 0.2, '2024-10-22', NULL),
(4, 'Final', 6.7, 10.0, 1.0, '2024-12-18', NULL),
(5, 'Final', 8.2, 10.0, 1.0, '2024-12-22', NULL),
(8, 'Final', 8.2, 10.0, 1.0, '2024-12-19', NULL),
(9, 'Final', 8.0, 10.0, 1.0, '2024-12-21', NULL);

INSERT INTO diem_danh (dang_ky_hoc_id, lich_hoc_id, lop_mon_hoc_id, ngay_diem_danh, trang_thai, ghi_chu) VALUES
(1, 1, 1, '2024-10-16', 'Co_mat', NULL),
(1, 2, 1, '2024-10-18', 'Co_mat', NULL),
(2, 3, 2, '2024-10-17', 'Tre', 'Traffic jam'),
(3, 4, 3, '2024-10-18', 'Co_mat', NULL),
(4, 1, 1, '2024-10-16', 'Vang', 'Sick'),
(8, 5, 7, '2024-10-17', 'Co_mat', NULL),
(9, 6, 8, '2024-10-17', 'Co_phep', 'School event');
    trinh_do VARCHAR(100),
    ngay_vao_lam DATE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL
);

CREATE TABLE hoc_ky (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_hoc_ky VARCHAR(100) NOT NULL,
    nam_hoc VARCHAR(20) NOT NULL,
    so_hoc_ky TINYINT NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    trang_thai ENUM('du_kien', 'dang_dien_ra', 'da_ket_thuc') NOT NULL DEFAULT 'du_kien',
    UNIQUE KEY unique_hoc_ky (nam_hoc, so_hoc_ky),
    CONSTRAINT chk_hoc_ky_ngay CHECK (ngay_bat_dau <= ngay_ket_thuc)
);

CREATE TABLE phong_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_phong VARCHAR(50) NOT NULL UNIQUE,
    toa_nha VARCHAR(100),
    tang INT,
    suc_chua INT,
    loai_phong ENUM('phong_hoc', 'phong_lab') NOT NULL DEFAULT 'phong_hoc',
    CONSTRAINT chk_phong_hoc_suc_chua CHECK (suc_chua IS NULL OR suc_chua > 0)
);

CREATE TABLE lop_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_lop VARCHAR(100) NOT NULL,
    khoi_lop VARCHAR(20),
    nam_hoc VARCHAR(20),
    giao_vien_chu_nhiem_id INT NULL,
    si_so_toi_da INT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (giao_vien_chu_nhiem_id) REFERENCES giao_vien(id) ON DELETE SET NULL,
    UNIQUE KEY unique_ten_lop_nam_hoc (ten_lop, nam_hoc),
    CONSTRAINT chk_lop_hoc_si_so CHECK (si_so_toi_da IS NULL OR si_so_toi_da > 0)
);

CREATE TABLE mon_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_mon VARCHAR(50) NOT NULL UNIQUE,
    ten_mon VARCHAR(100) NOT NULL UNIQUE,
    so_tin_chi INT NOT NULL DEFAULT 3,
    mo_ta TEXT,
    CONSTRAINT chk_mon_hoc_tin_chi CHECK (so_tin_chi BETWEEN 1 AND 10)
);

-- =========================================================
-- NGUOI HOC
-- =========================================================

CREATE TABLE sinh_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tai_khoan_id INT NULL UNIQUE,
    ma_sinh_vien VARCHAR(50) NOT NULL UNIQUE,
    ho VARCHAR(100) NOT NULL,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),
    ngay_sinh DATE,
    gioi_tinh ENUM('Nam', 'Nu', 'Khac'),
    dia_chi TEXT,
    lop_hoc_id INT NOT NULL,
    ngay_nhap_hoc DATE NOT NULL,
    ten_nguoi_giam_ho VARCHAR(150),
    so_dien_thoai_giam_ho VARCHAR(20),
    trang_thai ENUM('Dang_hoc', 'Bao_luu', 'Tot_nghiep', 'Tam_dung') NOT NULL DEFAULT 'Dang_hoc',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(id) ON DELETE SET NULL,
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id) ON DELETE RESTRICT
);

-- =========================================================
-- GIANG DAY
-- =========================================================

CREATE TABLE lop_mon_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lop_hoc_id INT NOT NULL,
    mon_hoc_id INT NOT NULL,
    hoc_ky_id INT NOT NULL,
    giao_vien_id INT NULL,
    ngay_phan_cong DATE,
    bat_buoc BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_hoc_id) REFERENCES mon_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (hoc_ky_id) REFERENCES hoc_ky(id) ON DELETE RESTRICT,
    FOREIGN KEY (giao_vien_id) REFERENCES giao_vien(id) ON DELETE SET NULL,
    UNIQUE KEY unique_lop_mon_hoc_hoc_ky (lop_hoc_id, mon_hoc_id, hoc_ky_id)
);

CREATE TABLE dang_ky_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sinh_vien_id INT NOT NULL,
    lop_mon_hoc_id INT NOT NULL,
    ngay_dang_ky DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('dang_hoc', 'rut_mon', 'hoan_thanh', 'khong_dat') NOT NULL DEFAULT 'dang_hoc',
    ghi_chu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sinh_vien_id) REFERENCES sinh_vien(id) ON DELETE CASCADE,
    FOREIGN KEY (lop_mon_hoc_id) REFERENCES lop_mon_hoc(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dang_ky_hoc (sinh_vien_id, lop_mon_hoc_id),
    INDEX idx_dang_ky_hoc_id_lop_mon_hoc (id, lop_mon_hoc_id)
);

CREATE TABLE lich_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lop_mon_hoc_id INT NOT NULL,
    phong_hoc_id INT NULL,
    thu_trong_tuan ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    tiet_hoc TINYINT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lop_mon_hoc_id) REFERENCES lop_mon_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (phong_hoc_id) REFERENCES phong_hoc(id) ON DELETE SET NULL,
    INDEX idx_lich_hoc_id_lop_mon_hoc (id, lop_mon_hoc_id),
    CONSTRAINT chk_lich_hoc_gio CHECK (gio_bat_dau < gio_ket_thuc)
);

-- =========================================================
-- DIEM VA DIEM DANH
-- =========================================================

CREATE TABLE diem_so (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dang_ky_hoc_id INT NOT NULL,
    loai_diem ENUM('Quiz', 'Assignment', 'Midterm', 'Final', 'Practice') NOT NULL,
    diem DECIMAL(5, 2) NOT NULL,
    diem_toi_da DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    trong_so DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    ngay_kiem_tra DATE,
    nhan_xet VARCHAR(255),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dang_ky_hoc_id) REFERENCES dang_ky_hoc(id) ON DELETE CASCADE,
    UNIQUE KEY unique_thanh_phan_diem (dang_ky_hoc_id, loai_diem, ngay_kiem_tra),
    CONSTRAINT chk_diem_so_hop_le CHECK (diem >= 0 AND diem_toi_da > 0 AND diem <= diem_toi_da),
    CONSTRAINT chk_diem_so_trong_so CHECK (trong_so >= 0 AND trong_so <= 1)
);

CREATE TABLE diem_danh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dang_ky_hoc_id INT NOT NULL,
    lich_hoc_id INT NOT NULL,
    lop_mon_hoc_id INT NOT NULL,
    ngay_diem_danh DATE NOT NULL,
    trang_thai ENUM('Co_mat', 'Vang', 'Tre', 'Co_phep') NOT NULL DEFAULT 'Co_mat',
    ghi_chu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dang_ky_hoc_id, lop_mon_hoc_id) REFERENCES dang_ky_hoc(id, lop_mon_hoc_id) ON DELETE CASCADE,
    FOREIGN KEY (lich_hoc_id, lop_mon_hoc_id) REFERENCES lich_hoc(id, lop_mon_hoc_id) ON DELETE CASCADE,
    UNIQUE KEY unique_diem_danh (dang_ky_hoc_id, lich_hoc_id, ngay_diem_danh)
);

-- =========================================================
-- DU LIEU MAU
-- =========================================================

INSERT INTO tai_khoan (ten_dang_nhap, email, mat_khau_ma_hoa, vai_tro) VALUES
('admin', 'admin@example.com', '$2b$12$YpNlhpz7uqndQas2EnJgWuzhsKu7nj.CMwAT9oqXLNc1LrzDPCitG', 'quan_tri'),
('teacher_nguyen', 'nguyent@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'giao_vien'),
('teacher_hoang', 'hoangh@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'giao_vien'),
('teacher_tran', 'trant@school.edu', '$2b$12$FEpIbRAGnZUjMVkSKbz4V.YL5RJwY2a6XoiZPoUey2NIsX7YzYgQ.', 'giao_vien'),
('student_s2025001', 'nguyenvana@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'sinh_vien'),
('student_s2025002', 'tranthib@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'sinh_vien'),
('student_s2025009', 'voquoci@example.com', '$2b$12$GBGlIfpwoPDPrIXpyS7SeuFIFckIQ05fmT7Sqa0ddi0x59D9Ek.OS', 'sinh_vien');

INSERT INTO giao_vien (tai_khoan_id, ma_giao_vien, ho, ten, email, so_dien_thoai, trinh_do, ngay_vao_lam) VALUES
(2, 'T001', 'Nguyen', 'Minh Chau', 'nguyent@school.edu', '0961234567', 'M.Sc Mathematics', '2020-08-01'),
(3, 'T002', 'Hoang', 'Thu Ha', 'hoangh@school.edu', '0962234567', 'M.Sc Physics', '2021-08-01'),
(4, 'T003', 'Tran', 'Thanh Long', 'trant@school.edu', '0963234567', 'M.A English Literature', '2019-08-01');

INSERT INTO hoc_ky (ten_hoc_ky, nam_hoc, so_hoc_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai) VALUES
('Hoc ky 1 2024-2025', '2024-2025', 1, '2024-08-15', '2024-12-31', 'dang_dien_ra'),
('Hoc ky 2 2024-2025', '2024-2025', 2, '2025-01-05', '2025-05-31', 'du_kien');

INSERT INTO phong_hoc (ma_phong, toa_nha, tang, suc_chua, loai_phong) VALUES
('A101', 'Toa A', 1, 45, 'phong_hoc'),
('A102', 'Toa A', 1, 45, 'phong_hoc'),
('A103', 'Toa A', 1, 40, 'phong_hoc'),
('LAB201', 'Toa B', 2, 35, 'phong_lab');

INSERT INTO lop_hoc (ten_lop, khoi_lop, nam_hoc, giao_vien_chu_nhiem_id, si_so_toi_da) VALUES
('10A1', '10', '2024-2025', 1, 40),
('10A2', '10', '2024-2025', 2, 40),
('11B1', '11', '2024-2025', 3, 38);

INSERT INTO mon_hoc (ma_mon, ten_mon, so_tin_chi, mo_ta) VALUES
('MATH101', 'Toan hoc', 4, 'Dai so, hinh hoc va giai tich co ban'),
('PHYS101', 'Vat ly', 4, 'Co hoc, dien hoc va nhiet hoc'),
('ENG101', 'Tieng Anh', 3, 'Tieng Anh hoc thuat va doc hieu'),
('CS101', 'Tin hoc', 4, 'Nhap mon lap trinh va thuat toan');

INSERT INTO sinh_vien (
    tai_khoan_id, ma_sinh_vien, ho, ten, email, so_dien_thoai, ngay_sinh,
    gioi_tinh, dia_chi, lop_hoc_id, ngay_nhap_hoc, ten_nguoi_giam_ho, so_dien_thoai_giam_ho, trang_thai
) VALUES
(5, 'S2025001', 'Nguyen', 'Van A', 'nguyenvana@example.com', '0912345678', '2008-02-15', 'Nam', '123 Le Loi, District 1, Ho Chi Minh City', 1, '2024-08-15', 'Nguyen Van Senior', '0901000001', 'Dang_hoc'),
(6, 'S2025002', 'Tran', 'Thi B', 'tranthib@example.com', '0905123456', '2008-06-03', 'Nu', '45 Nguyen Hue, District 1, Ho Chi Minh City', 1, '2024-08-15', 'Tran Thi Senior', '0901000002', 'Dang_hoc'),
(NULL, 'S2025003', 'Le', 'Minh C', 'leminhc@example.com', '0934567890', '2007-11-08', 'Nam', '78 Pasteur, District 3, Ho Chi Minh City', 1, '2024-08-15', 'Le Minh Parent', '0901000003', 'Dang_hoc'),
(7, 'S2025009', 'Vo', 'Quoc I', 'voquoci@example.com', '0941122334', '2007-09-12', 'Nam', '14 Hai Ba Trung, District 1, Ho Chi Minh City', 3, '2023-08-16', 'Vo Quoc Parent', '0901000009', 'Dang_hoc');

INSERT INTO lop_mon_hoc (lop_hoc_id, mon_hoc_id, hoc_ky_id, giao_vien_id, ngay_phan_cong, bat_buoc) VALUES
(1, 1, 1, 1, '2024-08-10', TRUE),
(1, 2, 1, 2, '2024-08-10', TRUE),
(1, 3, 1, 3, '2024-08-10', TRUE),
(1, 4, 1, 1, '2024-08-10', TRUE),
(2, 1, 1, 1, '2024-08-10', TRUE),
(2, 2, 1, 2, '2024-08-10', TRUE),
(3, 3, 1, 3, '2024-08-10', TRUE),
(3, 4, 1, 1, '2024-08-10', TRUE);

INSERT INTO dang_ky_hoc (sinh_vien_id, lop_mon_hoc_id, trang_thai, ghi_chu) VALUES
(1, 1, 'dang_hoc', NULL),
(1, 2, 'dang_hoc', NULL),
(1, 3, 'dang_hoc', NULL),
(2, 1, 'dang_hoc', NULL),
(2, 3, 'dang_hoc', NULL),
(3, 1, 'dang_hoc', NULL),
(3, 4, 'dang_hoc', NULL),
(4, 7, 'dang_hoc', NULL),
(4, 8, 'dang_hoc', NULL);

INSERT INTO lich_hoc (lop_mon_hoc_id, phong_hoc_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc, tiet_hoc) VALUES
(1, 1, 'Monday', '07:00:00', '08:30:00', 1),
(1, 1, 'Wednesday', '07:00:00', '08:30:00', 2),
(2, 2, 'Tuesday', '08:45:00', '10:15:00', 3),
(3, 3, 'Friday', '13:00:00', '14:30:00', 4),
(7, 3, 'Tuesday', '07:00:00', '08:30:00', 1),
(8, 4, 'Thursday', '07:00:00', '08:30:00', 2);

INSERT INTO diem_so (dang_ky_hoc_id, loai_diem, diem, diem_toi_da, trong_so, ngay_kiem_tra, nhan_xet) VALUES
(1, 'Midterm', 8.5, 10.0, 0.4, '2024-10-18', NULL),
(1, 'Final', 9.1, 10.0, 0.6, '2024-12-18', NULL),
(2, 'Final', 7.9, 10.0, 1.0, '2024-12-20', NULL),
(3, 'Quiz', 8.8, 10.0, 0.2, '2024-10-22', NULL),
(4, 'Final', 6.7, 10.0, 1.0, '2024-12-18', NULL),
(5, 'Final', 8.2, 10.0, 1.0, '2024-12-22', NULL),
(8, 'Final', 8.2, 10.0, 1.0, '2024-12-19', NULL),
(9, 'Final', 8.0, 10.0, 1.0, '2024-12-21', NULL);

INSERT INTO diem_danh (dang_ky_hoc_id, lich_hoc_id, lop_mon_hoc_id, ngay_diem_danh, trang_thai, ghi_chu) VALUES
(1, 1, 1, '2024-10-16', 'Co_mat', NULL),
(1, 2, 1, '2024-10-18', 'Co_mat', NULL),
(2, 3, 2, '2024-10-17', 'Tre', 'Traffic jam'),
(3, 4, 3, '2024-10-18', 'Co_mat', NULL),
(4, 1, 1, '2024-10-16', 'Vang', 'Sick'),
(8, 5, 7, '2024-10-17', 'Co_mat', NULL),
(9, 6, 8, '2024-10-17', 'Co_phep', 'School event');
