// Entry point for backend

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const Food = require('./models/Food');
const { Order, OrderItem } = require('./models/Order');
const OrderStatusHistory = require('./models/OrderStatusHistory');
const orderStatusRoutes = require('./api/orderStatusRoutes');
const orderRoutes = require('./api/orderRoutes');
const { generateToken } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Đăng ký
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Thiếu thông tin.' });
  try {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 8);
    const user = await User.create({ username, email, password: hash });
    res.json({ message: 'Đăng ký thành công!', user: { username: user.username, email: user.email } });
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
    const user = await User.findOne({ where: { username } });
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
        email: user.email 
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy danh sách món ăn
app.get('/api/foods', async (req, res) => {
  try {
    const foods = await Food.findAll({
      attributes: ['id', 'name', 'description', 'price', 'rating', 'imageUrl']
    });
    res.json(foods.map(food => ({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      rating: food.rating,
      imageUrl: food.imageUrl || ''
    })));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy danh sách đơn hàng của user
app.get('/api/user-orders', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'Thiếu username.' });
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    const orders = await Order.findAll({
      where: { userId: user.id },
      include: [{
        model: OrderItem,
        include: [{ model: Food }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders.map(order => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.OrderItems.map(item => ({
        id: item.id,
        foodName: item.Food?.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.Food?.imageUrl
      }))
    })));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Sử dụng order routes
app.use('/api/orders', orderRoutes);
// Order status routes sử dụng sub-routes của orders
app.use('/api/orders', orderStatusRoutes);

console.log('Backend server starting...');

// Khởi tạo DB và chạy server
(async () => {
  await sequelize.sync();
  // Thêm món ăn mẫu nếu chưa có
  const foods = [
    {
      name: 'Phở Bò',
      description: 'Phở bò truyền thống với nước dùng đậm đà.',
      price: 45000,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bún Bò Huế',
      description: 'Bún bò Huế cay nồng, thơm ngon đặc trưng miền Trung.',
      price: 40000,
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Cơm Tấm',
      description: 'Cơm tấm sườn bì chả, đặc sản Sài Gòn.',
      price: 35000,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Gỏi Cuốn',
      description: 'Gỏi cuốn tôm thịt tươi ngon, ăn kèm nước chấm đặc biệt.',
      price: 25000,
      rating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
    },
    {
      name: 'Bánh Mì',
      description: 'Bánh mì Việt Nam giòn rụm, nhân thịt nguội và rau thơm.',
      price: 20000,
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
    },
    // Bổ sung các món chưa có ảnh
    {
      name: 'Bánh Xèo',
      description: 'Bánh xèo miền Tây vàng giòn, nhân tôm thịt, ăn kèm rau sống.',
      price: 30000,
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    },
    {
      name: 'Chả Giò',
      description: 'Chả giò chiên giòn, nhân thịt và rau củ.',
      price: 22000,
      rating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
    },
    {
      name: 'Bún Chả',
      description: 'Bún chả Hà Nội với thịt nướng và nước mắm chua ngọt.',
      price: 40000,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
    },
    {
      name: 'Bánh Cuốn',
      description: 'Bánh cuốn nóng mềm mịn, ăn kèm chả và nước mắm.',
      price: 28000,
      rating: 4.3,
      imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
    }
  ];
  for (const food of foods) {
    await Food.findOrCreate({ where: { name: food.name }, defaults: food });
  }
  app.listen(5000, () => console.log('Backend server running on http://localhost:5000'));
})();
