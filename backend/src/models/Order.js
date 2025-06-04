const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Food = require('./Food');

const Order = sequelize.define('Order', {
  // Mỗi đơn hàng thuộc về 1 user
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Tổng tiền đơn hàng
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  // Trạng thái đơn hàng
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  }
});

const OrderItem = sequelize.define('OrderItem', {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  foodId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Food, { foreignKey: 'foodId' });

module.exports = { Order, OrderItem };
