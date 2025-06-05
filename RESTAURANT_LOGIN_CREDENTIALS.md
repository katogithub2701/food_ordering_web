# 🍽️ Restaurant Login Credentials

## ✅ Available Restaurant Account

Based on the database query and restaurant user creation script, here are the **confirmed restaurant login credentials**:

### **Primary Restaurant Account**
```
Username: restaurant_owner
Password: restaurant123
Email: restaurant@example.com
Role: restaurant
```

### **Restaurant Details**
- **Restaurant Name**: Nhà hàng mẫu
- **Restaurant ID**: 7
- **User ID**: 9
- **Address**: 456 Lê Lợi, Quận 1, TP.HCM
- **Description**: Nhà hàng phục vụ các món ăn truyền thống Việt Nam

## 🔐 How to Login

### **Via API (for testing)**
```bash
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "username": "restaurant_owner",
  "password": "restaurant123"
}
```

### **Via Frontend**
1. Go to the login page
2. Enter username: `restaurant_owner`
3. Enter password: `restaurant123`
4. The system will automatically detect this is a restaurant account
5. You'll be redirected to the restaurant portal/dashboard

## 🎯 Restaurant Portal Features

Once logged in with these credentials, you'll have access to:
- **Dashboard**: View order statistics and revenue
- **Order Management**: View and manage incoming orders
- **Food Management**: Add/edit menu items
- **Revenue Tracking**: Monitor restaurant earnings

## 📱 Frontend Access

If you're using the React frontend, navigate to the restaurant portal section after login to access the restaurant management features.

---
**Note**: This account was created during the bug fix process and is fully functional for testing restaurant features.
