@echo off
echo ============================================
echo  HUONG DAN CAI DAT NODE.JS CHO STUDENT MANAGEMENT
echo ============================================
echo.
echo Buoc 1: Tai Node.js LTS tu: https://nodejs.org/en/download/
echo Buoc 2: Chay file cai dat (.msi)
echo Buoc 3: Khoi dong lai PowerShell
echo Buoc 4: Chay lenh sau:
echo.
echo cd d:\OSS\student_management\frontend
echo npm install
echo npm run dev
echo.
echo ============================================
echo  SAU KHI CAI NODE.JS:
echo ============================================
echo.
echo # Chay web app
echo cd d:\OSS\student_management\frontend
echo npm install
echo npm run dev
echo.
echo # Chay desktop app (sau khi cai electron)
echo npm install -D electron electron-builder
echo npm run electron
echo.
echo # Chay mobile app (sau khi cai react-native)
echo npx create-react-native-app mobile
echo cd mobile
echo npm start
echo.
pause