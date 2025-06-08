# Tổng quan dự án Food Delivery App

Dự án này bao gồm backend (API), frontend (UI), CI/CD, tài liệu và các cấu hình cần thiết để triển khai một ứng dụng giao đồ ăn hiện đại.

## Tính năng chính
- Đăng ký, đăng nhập, xác thực người dùng
- Tìm kiếm và xem thông tin nhà hàng, món ăn
- Thêm món vào giỏ hàng, đặt hàng nhanh chóng
- Lựa chọn địa chỉ giao hàng, phương thức thanh toán
- Theo dõi trạng thái đơn hàng theo thời gian thực
- Quản lý đơn hàng cho người dùng và nhà hàng
- Giao diện quản trị cho nhà hàng

## Công nghệ sử dụng
- **Frontend:** ReactJS, Context API, CSS Modules
- **Backend:** Node.js, Express, SQLite
- **Khác:** JWT, RESTful API, Git

## Cấu trúc dự án
```
food_ordering_web/
  backend/      # Source code backend, API, models, services
  frontend/     # Source code frontend, UI React
  docs/         # Tài liệu API, hướng dẫn sử dụng, setup
  README.md
```

## Hướng dẫn cài đặt & chạy dự án

### 1. Clone repository
```bash
git clone <repo-url>
cd food_ordering_web
```

### 2. Chạy thủ công

#### Backend
```bash
cd backend
npm install
node src/app.js
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Tài liệu
- [docs/api_documentation.md](docs/api_documentation.md): Tài liệu API chi tiết
- [docs/project_setup.md](docs/project_setup.md): Hướng dẫn cài đặt, cấu hình
- [docs/order_management_api.md](docs/order_management_api.md): Quản lý đơn hàng


