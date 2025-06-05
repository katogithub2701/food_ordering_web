const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret key (trong production nên lưu trong environment variable)
const JWT_SECRET = process.env.JWT_SECRET || '123';

// Middleware xác thực JWT token
const authenticateToken = async (req, res, next) => {  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'ACCESS_TOKEN_REQUIRED',
        message: 'Access token is required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Lấy thông tin user từ database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'USER_NOT_FOUND',
        message: 'User not found' 
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'INVALID_TOKEN',
        message: 'Invalid token' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired' 
      });
    } else {
      return res.status(500).json({ 
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed' 
      });
    }
  }
};

// Middleware kiểm tra quyền admin (có thể mở rộng sau)
const requireAdmin = (req, res, next) => {
  // Tạm thời check based on username hoặc có thể thêm role field vào User model
  const adminUsers = ['admin', 'restaurant_admin'];
  
  if (!adminUsers.includes(req.user.username)) {
    return res.status(403).json({ 
      error: 'ADMIN_REQUIRED',
      message: 'Admin privileges required' 
    });
  }
  
  next();
};

// Helper function để tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  JWT_SECRET
};