const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// API lấy danh sách món ăn
router.get('/', async (req, res) => {
  try {
    const foods = await Food.findAll({
      attributes: ['id', 'name', 'description', 'price', 'rating', 'imageUrl', 'category'],
      include: [{
        model: Restaurant,
        attributes: ['id', 'name', 'address'],
        where: { isActive: true },
        required: false
      }],
      where: { isAvailable: true },
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
    res.json(foods.map(food => ({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      rating: food.rating,
      imageUrl: food.imageUrl || '',
      category: food.category,
      restaurant: food.Restaurant ? {
        id: food.Restaurant.id,
        name: food.Restaurant.name,
        address: food.Restaurant.address
      } : null
    })));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// API tìm kiếm món ăn
router.get('/search', async (req, res) => {
  const { query, category, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const whereClause = {
      isAvailable: true
    };
    
    if (query) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { category: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
      const foods = await Food.findAndCountAll({
      where: whereClause,
      include: [{
        model: Restaurant,
        attributes: ['id', 'name', 'address', 'category'],
        where: { isActive: true },
        required: true
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC'], ['name', 'ASC']]
    });
    
    res.json({
      foods: foods.rows.map(food => ({
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        rating: food.rating,
        imageUrl: food.imageUrl,
        category: food.category,
        restaurant: {
          id: food.Restaurant.id,
          name: food.Restaurant.name,
          address: food.Restaurant.address,
          category: food.Restaurant.category
        }
      })),
      total: foods.count,
      page: parseInt(page),
      totalPages: Math.ceil(foods.count / limit)
    });  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm món ăn.' });
  }
});

// API lấy categories của món ăn
router.get('/categories', async (req, res) => {
  try {
    const categories = await Food.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      where: { isAvailable: true }
    });
    
    res.json(categories.map(c => c.category));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

module.exports = router;
