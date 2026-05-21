# Desktop App Scaffold

Thư mục này là phần scaffold cho bản desktop bằng Electron.

## Chạy ở môi trường phát triển

1. Chạy frontend:
   `cd ../frontend && npm run dev`
2. Cài Electron trong thư mục này:
   `npm install`
3. Chạy desktop app:
   `npm run dev`

Electron mặc định mở `http://localhost:3000`.

## Build giao diện web trước khi đóng gói

`npm run build:web`

Sau bước này, Electron có thể tải file từ `../frontend/dist/index.html` khi chạy bản packaged.
