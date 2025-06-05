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
    
    let finalRestaurantId = restaurantId;
    
    // If creating a new restaurant
    if (role === 'restaurant' && restaurantData) {
      const newRestaurant = await Restaurant.create({
        name: restaurantData.name,
        address: restaurantData.address,
        phone: restaurantData.phone || null,
        description: restaurantData.description || null,
        category: restaurantData.category || 'Tổng hợp',
        rating: 0,
        isActive: true,
        openTime: '06:00',
        closeTime: '22:00'
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
  
  // Thêm nhà hàng mẫu
  const restaurants = [
    {
      name: 'Phở Hà Nội',
      description: 'Phở truyền thống Bắc Bộ với nước dùng trong vắt, thơm ngon',
      address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
      phone: '024-1234-5678',
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      category: 'Phở',
      openTime: '06:00',
      closeTime: '22:00'
    },
    {
      name: 'Bún Bò Huế Mười',
      description: 'Bún bò Huế cay nồng đậm đà, đặc sản xứ Huế',
      address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
      phone: '028-9876-5432',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
      rating: 4.6,
      category: 'Bún',
      openTime: '07:00',
      closeTime: '21:00'
    },
    {
      name: 'Cơm Tấm Sài Gòn',
      description: 'Cơm tấm sườn bì chả truyền thống Sài Gòn',
      address: '789 Lê Lợi, Quận 1, TP.HCM',
      phone: '028-1111-2222',
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
      rating: 4.7,
      category: 'Cơm',
      openTime: '06:30',
      closeTime: '23:00'
    },
    {
      name: 'Bánh Mì Huỳnh Hoa',
      description: 'Bánh mì Việt Nam với nhân thịt nguội và pate đặc biệt',
      address: '26 Lê Thị Riêng, Quận 1, TP.HCM',
      phone: '028-3333-4444',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
      rating: 4.5,
      category: 'Bánh mì',
      openTime: '05:00',
      closeTime: '20:00'
    },
    {
      name: 'Quán Chay Hoa Sen',
      description: 'Món chay thanh đạm, dinh dưỡng và ngon miệng',
      address: '159 Cao Thắng, Quận 3, TP.HCM',
      phone: '028-5555-6666',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      rating: 4.4,
      category: 'Chay',
      openTime: '07:00',
      closeTime: '21:30'
    }
  ];
  
  for (const restaurant of restaurants) {
    await Restaurant.findOrCreate({ 
      where: { name: restaurant.name }, 
      defaults: restaurant 
    });
  }
  
  // Cập nhật món ăn với restaurantId và thêm món ăn mới
  const foodUpdates = [
    { name: 'Phở Bò', restaurantId: 1, category: 'Phở' },
    { name: 'Bún Bò Huế', restaurantId: 2, category: 'Bún' },
    { name: 'Cơm Tấm', restaurantId: 3, category: 'Cơm' },
    { name: 'Gỏi Cuốn', restaurantId: 1, category: 'Khai vị' },
    { name: 'Bánh Mì', restaurantId: 4, category: 'Bánh mì' }
  ];
  
  for (const food of foodUpdates) {
    await Food.update(
      { restaurantId: food.restaurantId, category: food.category },
      { where: { name: food.name } }
    );
  }
  
  // Thêm món ăn mới cho từng nhà hàng
  const newFoods = [
    // Nhà hàng Phở Hà Nội (ID: 1)
    {
      name: 'Phở Gà',
      description: 'Phở gà nước dùng ngọt thanh, thịt gà mềm',
      price: 40000,
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
      restaurantId: 1,
      category: 'Phở'
    },
    {
      name: 'Nem Rán',
      description: 'Nem rán giòn rụm, nhân thịt heo và mộc nhĩ',
      price: 25000,
      rating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      restaurantId: 1,
      category: 'Khai vị'
    },
    // Nhà hàng Bún Bò Huế (ID: 2)
    {
      name: 'Bún Thịt Nướng',
      description: 'Bún thịt nướng thơm phức, ăn kèm rau sống',
      price: 38000,
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
      restaurantId: 2,
      category: 'Bún'
    },
    // Nhà hàng Cơm Tấm (ID: 3)
    {
      name: 'Cơm Gà Nướng',
      description: 'Cơm gà nướng mật ong thơm ngon',
      price: 42000,
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
      restaurantId: 3,
      category: 'Cơm'
    },
    // Nhà hàng Bánh Mì (ID: 4)
    {
      name: 'Bánh Mì Chả Cá',
      description: 'Bánh mì chả cá nướng đặc biệt',
      price: 25000,
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
      restaurantId: 4,
      category: 'Bánh mì'
    },
    // Nhà hàng Chay (ID: 5)
    {
      name: 'Cơm Chay Dưa Chua',
      description: 'Cơm chay với dưa chua và đậu phụ',
      price: 30000,
      rating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      restaurantId: 5,
      category: 'Chay'
    },
    // Thêm nhiều món ăn mẫu cho tìm kiếm
    {
      name: 'Bánh Xèo',
      description: 'Bánh xèo giòn tan, nhân tôm thịt và giá đỗ',
      price: 35000,
      rating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1559847844-d919a1fb6080?auto=format&fit=crop&w=400&q=80',
      restaurantId: 3,
      category: 'Món chính'
    },
    {
      name: 'Mì Quảng',
      description: 'Mì Quảng đặc sản miền Trung với tôm và thịt',
      price: 45000,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
      restaurantId: 2,
      category: 'Mì'
    },
    {
      name: 'Chè Ba Màu',
      description: 'Chè ba màu truyền thống với đậu xanh, đậu đỏ',
      price: 20000,
      rating: 4.1,
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80',
      restaurantId: 1,
      category: 'Tráng miệng'
    },
    {
      name: 'Bánh Cuốn',
      description: 'Bánh cuốn mỏng, nhân thịt băm và mộc nhĩ',
      price: 30000,
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      restaurantId: 1,
      category: 'Món chính'
    },
    {
      name: 'Cà Phê Sữa Đá',
      description: 'Cà phê phin truyền thống với sữa đặc',
      price: 15000,
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80',
      restaurantId: 4,
      category: 'Đồ uống'
    },
    {
      name: 'Bánh Flan',
      description: 'Bánh flan mềm mịn với caramel thơm ngon',
      price: 18000,
      rating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80',
      restaurantId: 5,
      category: 'Tráng miệng'
    }
  ];
  
  for (const food of newFoods) {
    await Food.findOrCreate({
      where: { name: food.name, restaurantId: food.restaurantId },
      defaults: food
    });
  }
  
  app.listen(5000, () => console.log('Backend server running on http://localhost:5000'));
})();
