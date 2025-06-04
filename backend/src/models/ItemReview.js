const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemReview = sequelize.define('ItemReview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reviewId: { type: DataTypes.INTEGER, allowNull: false },
  itemId: { type: DataTypes.INTEGER, allowNull: false },
  itemRating: { type: DataTypes.INTEGER, allowNull: false },
  itemComment: { type: DataTypes.TEXT }
}, {
  updatedAt: false,
  createdAt: false,
  tableName: 'item_reviews'
});

module.exports = ItemReview;
