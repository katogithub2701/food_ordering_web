const User = require('./User');
const Food = require('./Food');
const { Order, OrderItem } = require('./Order');

// Associations
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Food, { foreignKey: 'foodId' });
Food.hasMany(OrderItem, { foreignKey: 'foodId' });

module.exports = {
  User,
  Food,
  Order,
  OrderItem
  // ...add other models here as needed
};