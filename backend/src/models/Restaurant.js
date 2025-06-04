const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avgRating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null
  }
});

module.exports = Restaurant;
