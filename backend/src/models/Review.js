const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ItemReview = require('./ItemReview');
const User = require('./User');
const Restaurant = require('./Restaurant');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  restaurantId: { type: DataTypes.INTEGER, allowNull: false },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false }, // 1-5
  comment: { type: DataTypes.TEXT, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  updatedAt: false,
  tableName: 'reviews'
});

// Associations for reviews
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
Review.hasMany(ItemReview, { foreignKey: 'reviewId', as: 'itemReviews' });
ItemReview.belongsTo(Review, { foreignKey: 'reviewId', as: 'review' });

module.exports = Review;
