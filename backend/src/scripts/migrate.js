const sequelize = require('../config/database');
const { Order } = require('../models/Order');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const { ORDER_STATUS } = require('../services/orderStatusService');

/**
 * Database Migration Script for Order Status System
 * This script ensures database schema is up-to-date and creates sample data
 */

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Sync database with force=false to preserve existing data
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema updated successfully');
    
    // Check if we have any orders
    const orderCount = await Order.count();
    console.log(`📊 Current orders in database: ${orderCount}`);
    
    // Create sample orders if none exist
    if (orderCount === 0) {
      console.log('🏗️ Creating sample orders...');
      await createSampleOrders();
    }
    
    // Validate order statuses
    await validateOrderStatuses();
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function createSampleOrders() {
  const sampleOrders = [
    {
      userId: 1,
      restaurantId: 1,
      total: 285000,
      status: ORDER_STATUS.COMPLETED,
      deliveryAddress: '123 Đường ABC, Quận 1, TP.HCM',
      notes: 'Giao hàng nhanh nhé'
    },
    {
      userId: 1,
      restaurantId: 2,
      total: 450000,
      status: ORDER_STATUS.DELIVERING,
      deliveryAddress: '456 Đường XYZ, Quận 3, TP.HCM',
      notes: 'Tầng 3, chuông cửa bên trái'
    },
    {
      userId: 1,
      restaurantId: 3,
      total: 195000,
      status: ORDER_STATUS.PREPARING,
      deliveryAddress: '789 Đường DEF, Quận 5, TP.HCM',
      notes: 'Không cay'
    }
  ];

  for (const orderData of sampleOrders) {
    const order = await Order.create(orderData);
    
    // Create initial status history
    await OrderStatusHistory.create({
      orderId: order.id,
      status: orderData.status,
      changedBy: 'system',
      reason: 'Order created with initial status'
    });
    
    console.log(`📦 Created sample order #${order.id} with status: ${orderData.status}`);
  }
}

async function validateOrderStatuses() {
  console.log('🔍 Validating order statuses...');
  
  const orders = await Order.findAll();
  const validStatuses = Object.values(ORDER_STATUS);
  
  for (const order of orders) {
    if (!validStatuses.includes(order.status)) {
      console.warn(`⚠️ Order #${order.id} has invalid status: ${order.status}`);
      // Could auto-fix here if needed
    }
  }
  
  console.log('✅ Order status validation completed');
}

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, createSampleOrders, validateOrderStatuses };
