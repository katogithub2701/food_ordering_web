const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order').Order;

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  // ID đơn hàng
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  // Trạng thái trước đó
  fromStatus: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed', 
      'preparing',
      'ready_for_pickup',
      'picked_up',
      'delivering',
      'delivered',
      'completed',
      'cancelled',
      'delivery_failed',
      'returning',
      'returned',
      'refunded'
    ),
    allowNull: true // null cho trạng thái đầu tiên
  },
  // Trạng thái mới
  toStatus: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed', 
      'preparing',
      'ready_for_pickup',
      'picked_up',
      'delivering',
      'delivered',
      'completed',
      'cancelled',
      'delivery_failed',
      'returning',
      'returned',
      'refunded'
    ),
    allowNull: false
  },
  // Người thực hiện thay đổi
  changedBy: {
    type: DataTypes.STRING,
    allowNull: false // có thể là 'customer', 'restaurant', 'driver', 'system', 'admin'
  },
  // ID của người thực hiện (nếu có)
  changedById: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Lý do thay đổi
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Ghi chú thêm
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Thời gian thay đổi
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'OrderStatusHistories',
  indexes: [
    {
      fields: ['orderId', 'timestamp']
    },
    {
      fields: ['toStatus']
    }
  ]
});

// Định nghĩa mối quan hệ
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory' });

module.exports = OrderStatusHistory;
