const sequelize = require('../config/database');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const { Order, OrderItem } = require('../models/Order');
const OrderStatusHistory = require('../models/OrderStatusHistory');

async function syncDatabase() {
  try {
    console.log('Starting database sync...');
    
    // Force sync to recreate tables with new structure
    // This will drop existing data and recreate with updated models
    await sequelize.sync({ force: true });
    
    console.log('Database sync completed successfully!');
    
    // Add some sample data
    console.log('Adding sample data...');
      // Create sample users
    const bcrypt = require('bcryptjs');
    const user1 = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 8)
    });
    
    const user2 = await User.create({
      username: 'customer1',
      email: 'customer1@example.com', 
      password: await bcrypt.hash('password123', 8)
    });

    // Create sample restaurants first
    const restaurant1 = await Restaurant.create({
      name: 'Phở Hà Nội',
      description: 'Phở truyền thống Bắc Bộ với nước dùng trong vắt, thơm ngon',
      address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội',
      phone: '024-1234-5678',
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      category: 'Phở',
      openTime: '06:00',
      closeTime: '22:00'
    });

    const restaurant2 = await Restaurant.create({
      name: 'Bún Bò Huế',
      description: 'Bún bò Huế cay nồng đặc trưng miền Trung, nước dùng đậm đà',
      address: '456 Đường Lê Lợi, Quận 1, TP.HCM',
      phone: '028-9876-5432',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      rating: 4.6,
      category: 'Bún',
      openTime: '07:00',
      closeTime: '21:00'
    });

    // Create restaurant users
    const restaurantUser1 = await User.create({
      username: 'restaurant_pho',
      email: 'pho@restaurant.com',
      password: await bcrypt.hash('restaurant123', 8),
      role: 'restaurant',
      restaurantId: restaurant1.id
    });

    const restaurantUser2 = await User.create({
      username: 'restaurant_bun',
      email: 'bun@restaurant.com',
      password: await bcrypt.hash('restaurant123', 8),
      role: 'restaurant',
      restaurantId: restaurant2.id
    });
      // Add sample foods
    const foods = [
      {
        name: 'Phở Bò',
        description: 'Phở bò truyền thống với nước dùng đậm đà.',
        price: 45000,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        restaurantId: restaurant1.id,
        category: 'Phở'
      },
      {
        name: 'Bún Bò Huế',
        description: 'Bún bò Huế cay nồng, thơm ngon đặc trưng miền Trung.',
        price: 40000,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
        restaurantId: restaurant2.id,
        category: 'Bún'
      },
      {
        name: 'Cơm Tấm',
        description: 'Cơm tấm sườn bì chả, đặc sản Sài Gòn.',
        price: 35000,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
        restaurantId: restaurant1.id,
        category: 'Cơm'
      },
      {
        name: 'Phở Gà',
        description: 'Phở gà nước dùng ngọt thanh, thịt gà mềm',
        price: 40000,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
        restaurantId: restaurant1.id,
        category: 'Phở'
      },
      {
        name: 'Bún Thịt Nướng',
        description: 'Bún thịt nướng thơm phức, ăn kèm rau sống',
        price: 38000,
        rating: 4.4,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
        restaurantId: restaurant2.id,
        category: 'Bún'      }
    ];
    
    const createdFoods = [];
    for (const food of foods) {
      const createdFood = await Food.create(food);
      createdFoods.push(createdFood);
    }
    
    // Create sample orders
    const order1 = await Order.create({
      userId: user2.id,
      total: 90000,
      status: 'pending',
      customerNotes: 'Giao hàng nhanh nhé',
      deliveryAddress: '123 Nguyễn Trãi, Quận 1, TP.HCM',
      contactPhone: '0901234567'
    });
    
    // Add order items
    await OrderItem.create({
      orderId: order1.id,
      foodId: createdFoods[0].id,
      quantity: 1,
      price: 45000
    });
    
    await OrderItem.create({
      orderId: order1.id,
      foodId: createdFoods[1].id,
      quantity: 1,
      price: 40000
    });
    
    // Create another order
    const order2 = await Order.create({
      userId: user2.id,
      total: 35000,
      status: 'confirmed',
      customerNotes: 'Không cay',
      deliveryAddress: '456 Lê Lợi, Quận 3, TP.HCM',
      contactPhone: '0901234567'
    });
    
    await OrderItem.create({
      orderId: order2.id,
      foodId: createdFoods[2].id,
      quantity: 1,
      price: 35000
    });
    
    // Create status histories
    await OrderStatusHistory.create({
      orderId: order1.id,
      fromStatus: null,
      toStatus: 'pending',
      note: 'Order created',
      changedBy: 'system'
    });
    
    await OrderStatusHistory.create({
      orderId: order2.id,
      fromStatus: null,
      toStatus: 'pending',
      note: 'Order created',
      changedBy: 'system'
    });
    
    await OrderStatusHistory.create({
      orderId: order2.id,
      fromStatus: 'pending',
      toStatus: 'confirmed',
      note: 'Order confirmed by admin',
      changedBy: 'admin'
    });
      console.log('Sample data added successfully!');
    console.log(`Created users: ${user1.username}, ${user2.username}, ${restaurantUser1.username}, ${restaurantUser2.username}`);
    console.log(`Created restaurants: ${restaurant1.name}, ${restaurant2.name}`);
    console.log(`Created ${createdFoods.length} foods`);
    console.log(`Created 2 orders with items and status history`);
    
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
