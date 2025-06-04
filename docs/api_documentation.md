# API Documentation - Food Delivery App

## Authentication APIs

### POST /api/register
Đăng ký tài khoản mới.

**Request Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

### POST /api/login
Đăng nhập tài khoản.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

## Restaurant APIs

### GET /api/restaurants
Lấy danh sách tất cả nhà hàng.

**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "description": "string",
    "address": "string",
    "imageUrl": "string",
    "rating": "number",
    "category": "string",
    "foods": [
      {
        "id": "number",
        "name": "string",
        "price": "number",
        "imageUrl": "string"
      }
    ]
  }
]
```

### GET /api/restaurants/search
Tìm kiếm nhà hàng với bộ lọc.

**Query Parameters:**
- `query` (optional): Từ khóa tìm kiếm
- `category` (optional): Loại nhà hàng
- `page` (optional, default=1): Trang hiện tại
- `limit` (optional, default=10): Số lượng kết quả mỗi trang

**Response:**
```json
{
  "restaurants": [...],
  "total": "number",
  "page": "number", 
  "totalPages": "number"
}
```

### GET /api/categories
Lấy danh sách các loại nhà hàng.

**Response:**
```json
["Phở", "Cơm", "Bún", "Bánh mì", "Chay"]
```

## Food APIs

### GET /api/foods
Lấy danh sách món ăn.

## Order APIs

### GET /api/orders
Lấy danh sách đơn hàng của user.

**Query Parameters:**
- `username` (required): Tên đăng nhập

## Database Schema

### Users Table
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE) 
- password (HASHED)
- createdAt
- updatedAt

### Restaurants Table
- id (PRIMARY KEY)
- name
- description
- address
- phone
- imageUrl
- rating
- category
- openTime
- closeTime
- isActive
- createdAt
- updatedAt

### Foods Table
- id (PRIMARY KEY)
- name
- description
- price
- rating
- imageUrl
- restaurantId (FOREIGN KEY)
- category
- isAvailable
- createdAt
- updatedAt

### Orders Table
- id (PRIMARY KEY)
- userId (FOREIGN KEY)
- total
- status
- createdAt
- updatedAt

### OrderItems Table
- id (PRIMARY KEY)
- orderId (FOREIGN KEY)
- foodId (FOREIGN KEY)
- quantity
- price
- createdAt
- updatedAt
