const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
<<<<<<< HEAD
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Tổng hợp'
  },
  openTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '06:00'
  },
  closeTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '22:00'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
=======
  avgRating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null
>>>>>>> 34d5825872cad1a6e7d0d493d3769f5798aeb56a
  }
});

module.exports = Restaurant;
