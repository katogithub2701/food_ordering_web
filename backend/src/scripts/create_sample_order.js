const sequelize = require('../config/database');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const { Order, OrderItem } = require('../models/Order');

async function createSampleUserAndRestaurant() {
  // Create user if not exists
  let user = await User.findOne({ where: { username: 'testuser' } });
  if (!user) {
    user = await User.create({ username: 'testuser', email: 'testuser@example.com', password: '123456' });
  }  // Create restaurant if not exists
  let restaurant = await Restaurant.findOne({ where: { name: 'Nhà hàng mẫu' } });
  if (!restaurant) {
    restaurant = await Restaurant.create({ 
      name: 'Nhà hàng mẫu',
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      description: 'Nhà hàng phục vụ các món ăn truyền thống Việt Nam'
    });
  }  // Create food if not exists
  let food = await Food.findOne({ where: { name: 'Phở Bò' } });
  if (!food) {
    food = await Food.create({ 
      name: 'Phở Bò', 
      description: 'Phở bò truyền thống', 
      price: 45000,
      restaurantId: restaurant.id
    });
  }// Create order with complete address information
  const order = await Order.create({
    userId: user.id,
    total: 90000,
    status: 'completed',
    deliveryAddress: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
    contactPhone: '0901234567',
    recipientName: 'Nguyễn Văn A',
    customerNotes: 'Giao hàng trước 12h trưa. Gọi trước khi đến.',
    shippingFee: 15000,
    paymentMethod: 'cash'
  });
  await OrderItem.create({ orderId: order.id, foodId: food.id, quantity: 2, price: 45000 });
  console.log('Sample user, restaurant, food, and completed order with address created.');
}

if (require.main === module) {
  sequelize.sync().then(createSampleUserAndRestaurant).then(() => process.exit(0));
}
