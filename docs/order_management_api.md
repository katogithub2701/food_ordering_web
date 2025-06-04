# Order Management API Documentation

## Overview
This document provides comprehensive documentation for the Order Management API endpoints, including authentication, order management, and order status tracking.

## Authentication

All API endpoints require JWT authentication (except for registration and login). Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /api/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Đăng ký thành công!",
  "user": {
    "username": "string",
    "email": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing required fields
- `409` - Username or email already exists
- `500` - Server error

#### POST /api/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công!",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  },
  "token": "string"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing credentials
- `401` - Invalid credentials
- `500` - Server error

## Order Management Endpoints

### GET /api/orders
Get user's order list with pagination, filtering, and sorting.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by order status
- `sortBy` (optional): Sort field (createdAt, updatedAt, total, status) (default: createdAt)
- `sortOrder` (optional): Sort direction (ASC, DESC) (default: DESC)
- `startDate` (optional): Filter orders from this date (ISO format)
- `endDate` (optional): Filter orders until this date (ISO format)

**Example Request:**
```
GET /api/orders?page=1&limit=10&status=pending&sortBy=createdAt&sortOrder=DESC
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "total": 45000,
        "status": "pending",
        "createdAt": "2025-06-04T10:00:00.000Z",
        "updatedAt": "2025-06-04T10:00:00.000Z",
        "itemCount": 2,
        "items": [
          {
            "id": 1,
            "foodId": 1,
            "foodName": "Phở Bò",
            "quantity": 1,
            "price": 45000,
            "imageUrl": "https://..."
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "filters": {
      "status": "pending",
      "startDate": null,
      "endDate": null,
      "sortBy": "createdAt",
      "sortOrder": "DESC"
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid/missing token)
- `500` - Server error

### GET /api/orders/:orderId
Get detailed order information including status history.

**Path Parameters:**
- `orderId`: The ID of the order

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "total": 45000,
    "status": "pending",
    "createdAt": "2025-06-04T10:00:00.000Z",
    "updatedAt": "2025-06-04T10:00:00.000Z",
    "items": [
      {
        "id": 1,
        "foodId": 1,
        "foodName": "Phở Bò",
        "foodDescription": "Phở bò truyền thống với nước dùng đậm đà.",
        "quantity": 1,
        "price": 45000,
        "subtotal": 45000,
        "imageUrl": "https://..."
      }
    ],
    "statusHistory": [
      {
        "id": 1,
        "fromStatus": null,
        "toStatus": "pending",
        "note": "Order created",
        "changedAt": "2025-06-04T10:00:00.000Z",
        "changedBy": "system"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Order not found
- `500` - Server error

## Order Status Management (Admin/Restaurant)

### PUT /api/internal/orders/:orderId/status
Update order status (requires admin privileges).

**Path Parameters:**
- `orderId`: The ID of the order

**Request Body:**
```json
{
  "status": "string",
  "note": "string (optional)"
}
```

**Valid Status Values:**
- `pending` - Order is pending confirmation
- `confirmed` - Order has been confirmed
- `preparing` - Restaurant is preparing the order
- `ready` - Order is ready for pickup/delivery
- `out_for_delivery` - Order is out for delivery
- `delivered` - Order has been delivered
- `cancelled` - Order has been cancelled
- `refunded` - Order has been refunded
- `failed` - Order processing failed
- `on_hold` - Order is on hold
- `pickup_ready` - Order is ready for pickup
- `picked_up` - Order has been picked up
- `returned` - Order has been returned

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "oldStatus": "pending",
    "newStatus": "confirmed",
    "updatedAt": "2025-06-04T10:05:00.000Z"
  },
  "message": "Order status updated successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid status or status unchanged
- `401` - Unauthorized
- `403` - Admin privileges required
- `404` - Order not found
- `500` - Server error

## Order Status Tracking (Existing Endpoints)

### GET /api/orders/:orderId/status
Get current order status.

### PUT /api/orders/:orderId/status  
Update order status with validation.

### GET /api/orders/:orderId/status/history
Get complete status change history.

### GET /api/orders/:orderId/status/transitions
Get available status transitions from current status.

### GET /api/orders/status/definitions
Get all available order status definitions with Vietnamese labels.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

**Common Error Codes:**
- `ACCESS_TOKEN_REQUIRED` - Authorization header missing
- `INVALID_TOKEN` - JWT token is invalid
- `TOKEN_EXPIRED` - JWT token has expired
- `USER_NOT_FOUND` - User account not found
- `ADMIN_REQUIRED` - Admin privileges required
- `ORDER_NOT_FOUND` - Order does not exist
- `INVALID_STATUS` - Invalid order status value
- `STATUS_UNCHANGED` - Trying to set same status

## Rate Limiting

Currently no rate limiting is implemented, but consider implementing it for production use.

## Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (max 100)

Pagination metadata is included in responses:
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `totalItems`: Total number of items
- `itemsPerPage`: Items per page
- `hasNextPage`: Boolean indicating if next page exists
- `hasPreviousPage`: Boolean indicating if previous page exists

## Security Considerations

1. **JWT Tokens**: Tokens expire after 24 hours
2. **User Isolation**: Users can only access their own orders
3. **Admin Protection**: Status update endpoints require admin privileges
4. **Input Validation**: All inputs are validated and sanitized
5. **SQL Injection Protection**: Using Sequelize ORM with parameterized queries

## Data Models

### Order Model
```json
{
  "id": "number",
  "userId": "number", 
  "total": "decimal",
  "status": "enum",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### OrderItem Model
```json
{
  "id": "number",
  "orderId": "number",
  "foodId": "number", 
  "quantity": "number",
  "price": "decimal"
}
```

### OrderStatusHistory Model
```json
{
  "id": "number",
  "orderId": "number",
  "fromStatus": "enum",
  "toStatus": "enum", 
  "note": "text",
  "changedBy": "string",
  "createdAt": "datetime"
}
```
