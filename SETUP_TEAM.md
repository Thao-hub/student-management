# Setup Hướng Dẫn Cho Nhóm

Dự án được thiết kế để dễ setup trên **bất kỳ máy nào** trong nhóm. Theo các bước dưới đây.

---

## 📋 Yêu Cầu Tối Thiểu

- **Node.js 16+** - [Tải tại nodejs.org](https://nodejs.org/)
- **Python 3.8+** - [Tải tại python.org](https://www.python.org/)
- **MySQL 8.0+** - [Tải tại mysql.com](https://dev.mysql.com/downloads/)
- **Git** (optional) - [Tải tại git-scm.com](https://git-scm.com/)

### Kiểm Tra Đã Cài
```bash
node --version      # v16 trở lên
npm --version       # 8 trở lên
python --version    # 3.8 trở lên
mysql --version     # 8.0 trở lên
```

---

## 🗄️ Bước 1: Setup Database (Chỉ 1 người làm)

### Tùy Chọn A: Dùng MySQL Workbench (Dễ nhất)
1. Mở **MySQL Workbench**
2. **File → Open SQL Script** → Chọn `database/schema.sql`
3. Nhấp **Execute** (⚡ icon)
4. Xong! Database `student_management` đã tạo

### Tùy Chọn B: Dùng Command Line
```bash
# Windows PowerShell
mysql -u root -p < database\schema.sql

# macOS/Linux
mysql -u root -p < database/schema.sql

# Nhập password MySQL khi được hỏi
```

**Kết quả:**
```
mysql> source database/schema.sql
...
Query OK. Database created.
```

---

## 🔧 Bước 2: Setup Backend (Mỗi máy chạy một lần)

### 2.1. Vào Thư Mục Backend
```bash
cd d:\OSS\student_management\backend
# hoặc cd /path/to/student_management/backend
```

### 2.2. Tạo Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Kết quả:
```bash
(venv) PS d:\OSS\student_management\backend>
```

### 2.3. Cài Đặt Dependencies
```bash
pip install -r requirements.txt
```

### 2.4. Cấu Hình .env

**Cách 1: Nếu MySQL mặc định**
```bash
# Không cần thay đổi .env
# File sẵn có: database\schema.sql
```

**Cách 2: Nếu MySQL custom**
```bash
# Mở file backend\.env
# Chỉnh sửa:
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/student_management
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
APP_NAME=Student Management System
```

### 2.5. Chạy Backend
```bash
python -m uvicorn app.main:app --reload
```

**Kết quả mong đợi:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

✅ **Backend chạy tại: http://localhost:8000**

---

## 🎨 Bước 3: Setup Frontend (Mỗi máy chạy một lần)

### 3.1. Mở Terminal Mới (Giữ Backend chạy)

```bash
# Nhấp Windows + R, gõ powershell, Enter
# Hoặc mở PowerShell mới
```

### 3.2. Vào Thư Mục Frontend
```bash
cd d:\OSS\student_management\frontend
# hoặc cd /path/to/student_management/frontend
```

### 3.3. Cài Đặt Dependencies
```bash
npm install
```

**Thời gian:** ~2 phút (tuỳ tốc độ internet)

### 3.4. Chạy Frontend
```bash
npm run dev
```

**Kết quả mong đợi:**
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:3000/
```

✅ **Frontend chạy tại: http://localhost:3000**

---

## 🔑 Bước 4: Đăng Nhập & Kiểm Tra

1. Mở browser: **http://localhost:3000**
2. Đăng nhập:
   ```
   Username: admin
   Password: admin123
   ```
3. Xem Dashboard
4. Vào "Students" → Thêm sinh viên để test

---

## 📊 Bảng Terminal Cần Mở

| Terminal | Lệnh | Purpose |
|----------|------|---------|
| **Terminal 1** | `python -m uvicorn app.main:app --reload` | Backend (Port 8000) |
| **Terminal 2** | `npm run dev` | Frontend (Port 3000) |
| **Terminal 3** | (optional) | Git commands |

**💡 Tip:** Mở **3 terminal** cùng lúc để tiện

---

## 🔄 Quy Trình Hàng Ngày

### Lần Đầu Tiên
```
1. Setup Database (1 người)
2. Setup Backend (.venv)
3. Setup Frontend (node_modules)
4. Run tất cả
```

### Những Lần Sau
```bash
# Terminal 1 - Backend (nếu chưa chạy)
cd d:\OSS\student_management\backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload

# Terminal 2 - Frontend (nếu chưa chạy)
cd d:\OSS\student_management\frontend
npm run dev

# Mở Browser
# http://localhost:3000
```

---

## ✅ Danh Sách Kiểm Tra

- [ ] Node.js & npm đã cài
- [ ] Python 3.8+ đã cài
- [ ] MySQL 8.0+ đã cài
- [ ] Database `student_management` đã tạo
- [ ] Backend venv được kích hoạt
- [ ] Backend dependencies cài xong
- [ ] Frontend dependencies cài xong
- [ ] Backend chạy tại localhost:8000
- [ ] Frontend chạy tại localhost:3000
- [ ] Có thể đăng nhập với admin/admin123

---

## 🐛 Gỡ Lỗi

### Lỗi: "MySQL Connection Failed"
```bash
# Kiểm tra MySQL chạy
mysql -u root -p

# Kiểm tra .env DATABASE_URL đúng
# Mặc định: mysql+pymysql://root:password@localhost:3306/student_management
```

### Lỗi: "Port 3000 already in use"
```bash
# Đổi port trong frontend\vite.config.js
# Hoặc dừng process khác dùng port 3000
```

### Lỗi: "ModuleNotFoundError"
```bash
# Kiểm tra venv kích hoạt
venv\Scripts\activate

# Kiểm tra requirements cài xong
pip install -r requirements.txt
```

### Lỗi: "npm ERR!"
```bash
# Xóa node_modules
rm -r node_modules  # macOS/Linux
rmdir node_modules /s  # Windows

# Cài lại
npm install
```

---

## 📁 Cấu Trúc Thư Mục Mong Đợi

```
student_management/
├── backend/
│   ├── venv/                    # Virtual environment (sau khi tạo)
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   └── ...
│   ├── requirements.txt
│   ├── .env                     # Cấu hình (có sẵn)
│   └── .gitignore
│
├── frontend/
│   ├── node_modules/            # Dependencies (sau khi npm install)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
├── database/
│   └── schema.sql               # Database schema
│
└── [Docs & Config files]
```

---

## 🚀 Script Tự Động (Optional)

### Windows PowerShell Script

Tạo file `setup.ps1`:
```powershell
# Setup Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
echo "Backend ready!"

# Setup Frontend
cd ..\frontend
npm install
echo "Frontend ready!"

echo "Setup complete! Start with:"
echo "Terminal 1: cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --reload"
echo "Terminal 2: cd frontend && npm run dev"
```

**Chạy:**
```bash
.\setup.ps1
```

### Bash Script (macOS/Linux)

Tạo file `setup.sh`:
```bash
#!/bin/bash

# Setup Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "Backend ready!"

# Setup Frontend
cd ../frontend
npm install
echo "Frontend ready!"

echo "Setup complete! Start with:"
echo "Terminal 1: cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload"
echo "Terminal 2: cd frontend && npm run dev"
```

**Chạy:**
```bash
chmod +x setup.sh
./setup.sh
```

---

## 💾 Data Persistence

### Database
- **Vị trí:** MySQL server (thường tại `localhost:3306`)
- **Tên:** `student_management`
- **Sẽ persist** nếu MySQL server chạy

### Frontend
- **Local Storage:** Token lưu trong browser
- **Khi xóa cache:** Cần login lại

### Backend
- Không lưu state (stateless)
- Mỗi lần restart không ảnh hưởng data

---

## 🔐 Bảo Mật Cho Nhóm

### ✅ Công Khai (Safe)
```
GitHub config files
Environment variables (.env template)
Database schema
Documentation
```

### ⚠️ Giữ Kín
```
.env file (credentials thực)
SECRET_KEY
Database password
Production keys
```

### .gitignore (Sẵn có)
```
venv/
.env
node_modules/
__pycache__/
*.pyc
.DS_Store
```

---

## 📞 Hỗ Trợ Cho Nhóm

### Bất Kỳ Ai Gặp Lỗi
1. **Check logs** trong terminal
2. **Google lỗi message**
3. **Post lỗi** ở nhóm chat
4. **Tham khảo** DEVELOPER_GUIDE.md

### Nếu Database Có Issue
- 1 người reset database
- Chạy lại `schema.sql`
- Mọi người load lại trang

### Nếu Dependencies Có Issue
```bash
# Xóa cache
pip cache purge
npm cache clean --force

# Cài lại
pip install -r requirements.txt
npm install
```

---

## 🎯 Qui Trình Chuẩn Cho Nhóm

### Lần Đầu (Người Setup)
```bash
1. Clone project
2. cd database && mysql -u root -p < schema.sql
3. cd ../backend && python -m venv venv
4. venv\Scripts\activate
5. pip install -r requirements.txt
6. python -m uvicorn app.main:app --reload
```

### Lần Đầu (Máy Khác)
```bash
1. Clone project
2. Backend: python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
3. Frontend: npm install
4. Cả 2 chạy như bình thường
```

### Sau Mỗi Lần Reboot
```bash
# Terminal 1
cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm run dev
```

---

## 📝 Ghi Chú Quan Trọng

1. **Không commit venv hoặc node_modules**
   - Đã có `.gitignore`
   - Mỗi máy tự sinh ra

2. **Cùng một Database**
   - Dùng localhost MySQL
   - Nếu lỗi connection, check credentials

3. **Port Có Thể Xung Đột**
   - Backend: 8000
   - Frontend: 3000
   - Đổi được nếu cần

4. **Token Hết Hạn**
   - 30 phút auto logout
   - Login lại là xong

5. **Cache Browser**
   - Ctrl+Shift+Delete xóa cache
   - Hoặc dùng Incognito mode

---

## ✨ Tips Cho Nhóm

- ✅ Tạo nhóm chat để báo issues
- ✅ Giữ Git repo sạch
- ✅ Pull/Push thường xuyên
- ✅ Commit description rõ ràng
- ✅ Test trước khi push
- ✅ Backup database thường xuyên

---

**Version**: 1.0  
**Last Updated**: April 7, 2026  
**For Team Use**
