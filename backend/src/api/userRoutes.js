const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Cart, CartItem } = require('../models/Cart');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const { Order, OrderItem } = require('../models/Order');

// API lấy danh sách đơn hàng của user
router.get('/user-orders', async (req, res) => {
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

// API lấy giỏ hàng của user
router.get('/cart', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'Thiếu username.' });
  try {
    const user = await User.findOne({ where: { username } });
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
    });  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API thêm món ăn vào giỏ hàng
router.post('/cart/add', async (req, res) => {
  const { username, foodId, quantity = 1 } = req.body;
  if (!username || !foodId) return res.status(400).json({ message: 'Thiếu thông tin.' });
  
  try {
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
    } else {
      // Thêm món mới
      cartItem = await CartItem.create({
        cartId: cart.id,
        foodId: foodId,
        quantity: parseInt(quantity),
        price: food.price
      });
    }
    
    // Cập nhật tổng tiền
    await updateCartTotal(cart.id);
    
    res.json({ message: 'Đã thêm vào giỏ hàng!', cartItem });  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API cập nhật số lượng món ăn trong giỏ
router.put('/cart/update', async (req, res) => {
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
    
    res.json({ message: 'Đã cập nhật giỏ hàng!' });  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API xóa món ăn khỏi giỏ
router.delete('/cart/remove', async (req, res) => {
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
    
    res.json({ message: 'Đã xóa khỏi giỏ hàng!' });  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API xóa toàn bộ giỏ hàng
router.delete('/cart/clear', async (req, res) => {
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
    
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng!' });  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Hàm helper cập nhật tổng tiền giỏ hàng
async function updateCartTotal(cartId) {
  try {
    const cartItems = await CartItem.findAll({ where: { cartId } });
    const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    await Cart.update({ total }, { where: { id: cartId } });
    return total;  } catch (err) {
    return 0;
  }
}

module.exports = router;
