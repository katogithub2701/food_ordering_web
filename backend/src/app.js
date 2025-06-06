// Entry point for backend

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const Food = require('./models/Food');
const Restaurant = require('./models/Restaurant');
const { Cart, CartItem } = require('./models/Cart');

// Import route modules
const orderStatusRoutes = require('./api/orderStatusRoutes');
const orderRoutes = require('./api/orderRoutes');
const addressRoutes = require('./api/addressRoutes');
const paymentRoutes = require('./api/paymentRoutes');
const restaurantRoutes = require('./api/restaurantRoutes');
const foodRoutes = require('./api/foodRoutes');
const userRoutes = require('./api/userRoutes');
const restaurantPortalRoutes = require('./api/restaurantPortalRoutes');

const jwt = require('jsonwebtoken');

// Hàm tạo token JWT
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || '123', {
    expiresIn: '7d' // Token sẽ hết hạn sau 7 ngày
  });
}

// Thiết lập quan hệ
Restaurant.hasMany(Food, { foreignKey: 'restaurantId' });
Food.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

// Thiết lập quan hệ User-Restaurant
User.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Restaurant.hasMany(User, { foreignKey: 'restaurantId' });

// Thiết lập quan hệ Cart
Cart.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Food, { foreignKey: 'foodId' });
Food.hasMany(CartItem, { foreignKey: 'foodId' });

const app = express();
app.use(cors());
app.use(express.json());

// Đăng ký
app.post('/api/register', async (req, res) => {
  const { username, email, password, role = 'customer', restaurantId, restaurantData } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Thiếu thông tin.' });
  
  // Validate role
  if (!['customer', 'restaurant'].includes(role)) {
    return res.status(400).json({ message: 'Role không hợp lệ.' });
  }
  
  // If role is restaurant, either restaurantId OR restaurantData is required
  if (role === 'restaurant' && !restaurantId && !restaurantData) {
    return res.status(400).json({ message: 'Thông tin nhà hàng là bắt buộc cho tài khoản nhà hàng.' });
  }
  
  // If restaurantData is provided, validate required fields
  if (restaurantData && (!restaurantData.name || !restaurantData.address)) {
    return res.status(400).json({ message: 'Tên và địa chỉ nhà hàng là bắt buộc.' });
  }
  
  try {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 8);
    
    let finalRestaurantId = restaurantId;    // If creating a new restaurant
    if (role === 'restaurant' && restaurantData) {
      const newRestaurant = await Restaurant.create({
        name: restaurantData.name,
        address: restaurantData.address,
        phone: restaurantData.phone || null,
        description: restaurantData.description || null,
        category: restaurantData.category || 'Tổng hợp',
        rating: 0,
        isActive: true,
        openTime: restaurantData.openTime || '06:00',
        closeTime: restaurantData.closeTime || '22:00',
        imageUrl: restaurantData.imageUrl || null
      });
      finalRestaurantId = newRestaurant.id;
    }
    
    const userData = { 
      username, 
      email, 
      password: hash, 
      role 
    };
    
    if (role === 'restaurant') {
      userData.restaurantId = finalRestaurantId;
    }
      const user = await User.create(userData);
    
    const successMessage = role === 'restaurant' && restaurantData 
      ? 'Đăng ký thành công! Nhà hàng và tài khoản quản lý đã được tạo.'
      : 'Đăng ký thành công!';
      
    res.json({
      message: successMessage, 
      user: { 
        username: user.username, 
        email: user.email, 
        role: user.role,
        restaurantId: user.restaurantId 
      } 
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: 'Tên đăng nhập hoặc email đã tồn tại.' });
    } else {
      res.status(500).json({ message: 'Lỗi server.' });
    }
  }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Thiếu thông tin.' });
  try {
    const user = await User.findOne({ 
      where: { username },
      include: [{
        model: Restaurant,
        attributes: ['id', 'name'],
        required: false
      }]
    });
    if (!user) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
    const bcrypt = require('bcryptjs');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    res.json({ 
      message: 'Đăng nhập thành công!', 
      user: { 
        id: user.id,
        username: user.username, 
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        restaurant: user.Restaurant ? {
          id: user.Restaurant.id,
          name: user.Restaurant.name
        } : null
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders', orderStatusRoutes);
app.use('/api/users', addressRoutes);
app.use('/api', paymentRoutes);
app.use('/api', userRoutes);
app.use('/api/restaurant-portal', restaurantPortalRoutes);

console.log('Backend server starting...');

// Khởi tạo DB và chạy server
(async () => {
  await sequelize.sync({ force: false });
  
  app.listen(5000, () => console.log('Backend server running on http://localhost:5000'));
})();
