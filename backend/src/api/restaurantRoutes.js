const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// API tìm kiếm nhà hàng
router.get('/search', async (req, res) => {
  const { query, category, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const whereClause = {
      isActive: true
    };
    
    if (query) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { address: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    const restaurants = await Restaurant.findAndCountAll({
      where: whereClause,
      include: [{
        model: Food,
        attributes: ['id', 'name', 'price', 'imageUrl'],
        limit: 3
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC']]
    });
    
    res.json({
      restaurants: restaurants.rows.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        imageUrl: restaurant.imageUrl,
        rating: restaurant.rating,
        category: restaurant.category,
        openTime: restaurant.openTime,
        closeTime: restaurant.closeTime,
        foods: restaurant.Foods
      })),
      total: restaurants.count,
      page: parseInt(page),
      totalPages: Math.ceil(restaurants.count / limit)
    });  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm.' });
  }
});

// API lấy danh sách nhà hàng
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { isActive: true },
      include: [{
        model: Food,
        attributes: ['id', 'name', 'price', 'imageUrl'],
        limit: 3
      }],
      order: [['rating', 'DESC']]
    });
    
    res.json(restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      imageUrl: restaurant.imageUrl,
      rating: restaurant.rating,
      category: restaurant.category,
      foods: restaurant.Foods
    })));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Restaurant.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      where: { isActive: true }
    });
    
    res.json(categories.map(c => c.category));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy chi tiết nhà hàng theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findOne({
      where: { id, isActive: true },
      include: [{
        model: Food,
        attributes: ['id', 'name', 'price', 'imageUrl', 'rating'],
        where: { isAvailable: true },
        required: false
      }]
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng.' });
    }
    
    res.json({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      imageUrl: restaurant.imageUrl,
      rating: restaurant.rating,
      category: restaurant.category,
      openTime: restaurant.openTime,
      closeTime: restaurant.closeTime,
      foods: restaurant.Foods
    });  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API lấy danh sách món ăn của nhà hàng
router.get('/:id/foods', async (req, res) => {
  const { id } = req.params;
  try {
    const foods = await Food.findAll({
      where: { 
        restaurantId: id,
        isAvailable: true 
      },
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
    
    res.json(foods.map(food => ({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      rating: food.rating,
      imageUrl: food.imageUrl,
      category: food.category
    })));  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

module.exports = router;
