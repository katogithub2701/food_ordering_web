// Entry point for backend

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const Food = require('./models/Food');
const Restaurant = require('./models/Restaurant');
const { Order, OrderItem } = require('./models/Order');
const OrderStatusHistory = require('./models/OrderStatusHistory');
const orderStatusRoutes = require('./api/orderStatusRoutes');
const orderRoutes = require('./api/orderRoutes');
const addressRoutes = require('./api/addressRoutes');
const paymentRoutes = require('./api/paymentRoutes');
const { Cart, CartItem } = require('./models/Cart');
const { Op } = require('sequelize');

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

// Thiết lập quan hệ Cart
Cart.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Food, { foreignKey: 'foodId' });
Food.hasMany(CartItem, { foreignKey: 'foodId' });

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
      attributes: ['id', 'name', 'description', 'price', 'rating', 'imageUrl', 'category'],
      include: [{
        model: Restaurant,
        attributes: ['id', 'name', 'address'],
        where: { isActive: true },
        required: false
      }],
      where: { isAvailable: true }
    });
    res.json(foods.map(food => ({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      rating: food.rating,
      imageUrl: food.imageUrl || '',
      category: food.category,
      restaurant: food.Restaurant ? {
        id: food.Restaurant.id,
        name: food.Restaurant.name,
        address: food.Restaurant.address
      } : null
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
// Sử dụng order status routes
app.use('/api/orders', orderStatusRoutes);
// Sử dụng address routes
app.use('/api/users', addressRoutes);
// Sử dụng payment routes
app.use('/api', paymentRoutes);
// API tìm kiếm nhà hàng
app.get('/api/restaurants/search', async (req, res) => {
  const { query, category, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const whereClause = {
      isActive: true
    };
    
    if (query) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { address: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    const restaurants = await Restaurant.findAndCountAll({
      where: whereClause,
      include: [{
        model: Food,
        attributes: ['id', 'name', 'price', 'imageUrl'],
        limit: 3
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC']]
    });
    
    res.json({
      restaurants: restaurants.rows.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        imageUrl: restaurant.imageUrl,
        rating: restaurant.rating,
        category: restaurant.category,
        openTime: restaurant.openTime,
        closeTime: restaurant.closeTime,
        foods: restaurant.Foods
      })),
      total: restaurants.count,
      page: parseInt(page),
      totalPages: Math.ceil(restaurants.count / limit)
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm.' });
  }
});

// API lấy danh sách nhà hàng
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { isActive: true },
      include: [{
        model: Food,
        attributes: ['id', 'name', 'price', 'imageUrl'],
        limit: 3
      }],
      order: [['rating', 'DESC']]
    });
    
    res.json(restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      imageUrl: restaurant.imageUrl,
      rating: restaurant.rating,
      category: restaurant.category,
      foods: restaurant.Foods
    })));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Restaurant.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      where: { isActive: true }
    });
    
    res.json(categories.map(c => c.category));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy chi tiết nhà hàng theo ID
app.get('/api/restaurants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findOne({
      where: { id, isActive: true },
      include: [{
        model: Food,
        attributes: ['id', 'name', 'price', 'imageUrl', 'rating'],
        where: { isAvailable: true },
        required: false
      }]
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng.' });
    }
    
    res.json({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      imageUrl: restaurant.imageUrl,
      rating: restaurant.rating,
      category: restaurant.category,
      openTime: restaurant.openTime,
      closeTime: restaurant.closeTime,
      foods: restaurant.Foods
    });
  } catch (err) {
    console.error('Restaurant detail error:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy danh sách món ăn của nhà hàng
app.get('/api/restaurants/:id/foods', async (req, res) => {
  const { id } = req.params;
  try {
    const foods = await Food.findAll({
      where: { 
        restaurantId: id,
        isAvailable: true 
      },
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
    
    res.json(foods.map(food => ({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      rating: food.rating,
      imageUrl: food.imageUrl,
      category: food.category
    })));
  } catch (err) {
    console.error('Restaurant foods error:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API tìm kiếm món ăn
app.get('/api/foods/search', async (req, res) => {
  const { query, category, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const whereClause = {
      isAvailable: true
    };
    
    if (query) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { category: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
      const foods = await Food.findAndCountAll({
      where: whereClause,
      include: [{
        model: Restaurant,
        attributes: ['id', 'name', 'address', 'category'],
        where: { isActive: true },
        required: true
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
    
    res.json({
      foods: foods.rows.map(food => ({
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        rating: food.rating,
        imageUrl: food.imageUrl,
        category: food.category,
        restaurant: {
          id: food.Restaurant.id,
          name: food.Restaurant.name,
          address: food.Restaurant.address,
          category: food.Restaurant.category
        }
      })),
      total: foods.count,
      page: parseInt(page),
      totalPages: Math.ceil(foods.count / limit)
    });
  } catch (err) {
    console.error('Food search error:', err);
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm món ăn.' });
  }
});

// API lấy categories của món ăn
app.get('/api/foods/categories', async (req, res) => {
  try {
    const categories = await Food.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      where: { isAvailable: true }
    });
    
    res.json(categories.map(c => c.category));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy giỏ hàng của user
app.get('/api/cart', async (req, res) => {
  const { username } = req.query;
  console.log('username query:', username); // Log username nhận được
  if (!username) return res.status(400).json({ message: 'Thiếu username.' });
  try {
    const user = await User.findOne({ where: { username } });
    console.log('user found:', user); // Log user tìm được
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    
    let cart = await Cart.findOne({
      where: { userId: user.id },
      include: [{
        model: CartItem,
        include: [{
          model: Food,
          include: [{ model: Restaurant, attributes: ['name'] }]
        }]
      }]
    });
    
    if (!cart) {
      cart = await Cart.create({ userId: user.id, total: 0 });
      cart.CartItems = [];
    }
    
    res.json({
      id: cart.id,
      total: cart.total,
      items: cart.CartItems.map(item => ({
        id: item.id,
        foodId: item.foodId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
        food: item.Food ? {
          id: item.Food.id,
          name: item.Food.name,
          description: item.Food.description,
          imageUrl: item.Food.imageUrl,
          restaurantName: item.Food.Restaurant?.name
        } : null
      }))
    });
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API thêm món ăn vào giỏ hàng
app.post('/api/cart/add', async (req, res) => {
  const { username, foodId, quantity = 1 } = req.body;
  if (!username || !foodId) return res.status(400).json({ message: 'Thiếu thông tin.' });
  
  try {
    // Debug log để kiểm tra dữ liệu nhận được từ frontend
    // console.log('Add to cart:', req.body);

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    
    const food = await Food.findByPk(foodId);
    if (!food) return res.status(404).json({ message: 'Không tìm thấy món ăn.' });
    
    let cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: user.id, total: 0 });
    }
    
    // Kiểm tra xem món ăn đã có trong giỏ chưa
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, foodId: foodId }
    });
    
    if (cartItem) {
      // Cập nhật số lượng
      cartItem.quantity += parseInt(quantity);
      await cartItem.save();
      console.log('CartItem updated:', cartItem.toJSON ? cartItem.toJSON() : cartItem);
    } else {
      // Thêm món mới
      cartItem = await CartItem.create({
        cartId: cart.id,
        foodId: foodId,
        quantity: parseInt(quantity),
        price: food.price
      });
      console.log('CartItem created:', cartItem.toJSON ? cartItem.toJSON() : cartItem);
    }
    
    // Cập nhật tổng tiền
    await updateCartTotal(cart.id);
    
    res.json({ message: 'Đã thêm vào giỏ hàng!', cartItem });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API cập nhật số lượng món ăn trong giỏ
app.put('/api/cart/update', async (req, res) => {
  const { username, cartItemId, quantity } = req.body;
  if (!username || !cartItemId || quantity < 1) {
    return res.status(400).json({ message: 'Thông tin không hợp lệ.' });
  }
  
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    
    const cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng.' });
    
    const cartItem = await CartItem.findOne({
      where: { id: cartItemId, cartId: cart.id }
    });
    
    if (!cartItem) return res.status(404).json({ message: 'Không tìm thấy món ăn trong giỏ.' });
    
    cartItem.quantity = parseInt(quantity);
    await cartItem.save();
    
    // Cập nhật tổng tiền
    await updateCartTotal(cart.id);
    
    res.json({ message: 'Đã cập nhật giỏ hàng!' });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API xóa món ăn khỏi giỏ
app.delete('/api/cart/remove', async (req, res) => {
  const { username, cartItemId } = req.body;
  if (!username || !cartItemId) return res.status(400).json({ message: 'Thiếu thông tin.' });
  
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    
    const cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng.' });
    
    const cartItem = await CartItem.findOne({
      where: { id: cartItemId, cartId: cart.id }
    });
    
    if (!cartItem) return res.status(404).json({ message: 'Không tìm thấy món ăn trong giỏ.' });
    
    await cartItem.destroy();
    
    // Cập nhật tổng tiền
    await updateCartTotal(cart.id);
    
    res.json({ message: 'Đã xóa khỏi giỏ hàng!' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API xóa toàn bộ giỏ hàng
app.delete('/api/cart/clear', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Thiếu username.' });
  
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    
    const cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng.' });
    
    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.total = 0;
    await cart.save();
    
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng!' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Hàm helper cập nhật tổng tiền giỏ hàng
async function updateCartTotal(cartId) {
  try {
    const cartItems = await CartItem.findAll({ where: { cartId } });
    const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    await Cart.update({ total }, { where: { id: cartId } });
    return total;
  } catch (err) {
    console.error('Update cart total error:', err);
    return 0;
  }
}

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
