const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Review = require('../models/Review');
const ItemReview = require('../models/ItemReview');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const { Order } = require('../models/Order');
const { Op, fn, col } = require('sequelize');

// POST /api/reviews
router.post('/reviews', authenticateToken, async (req, res) => {
  try {
    const { orderId, restaurantId, rating, comment, itemRatings } = req.body;
    const userId = req.user.id;
    // Kiểm tra quyền đánh giá
    const order = await Order.findOne({ where: { id: orderId, userId, restaurantId, status: 'completed' } });
    if (!order) return res.status(403).json({ success: false, message: 'Bạn không thể đánh giá đơn hàng này.' });
    // Kiểm tra đã đánh giá chưa
    const existed = await Review.findOne({ where: { orderId, userId } });
    if (existed) return res.status(409).json({ success: false, message: 'Bạn đã đánh giá đơn hàng này.' });
    // Lưu đánh giá nhà hàng
    const review = await Review.create({ userId, restaurantId, orderId, rating, comment });
    // Lưu đánh giá món ăn (nếu có)
    if (Array.isArray(itemRatings)) {
      for (const item of itemRatings) {
        await ItemReview.create({
          reviewId: review.id,
          itemId: item.itemId,
          itemRating: item.itemRating,
          itemComment: item.itemComment || ''
        });
      }
    }
    // Cập nhật điểm trung bình cho nhà hàng
    const avg = await Review.findAll({
      where: { restaurantId },
      attributes: [[fn('AVG', col('rating')), 'avgRating']]
    });
    await Restaurant.update({ avgRating: avg[0].dataValues.avgRating }, { where: { id: restaurantId } });
    // Cập nhật điểm trung bình cho món ăn (nếu có)
    if (Array.isArray(itemRatings)) {
      for (const item of itemRatings) {
        const avgItem = await ItemReview.findAll({
          where: { itemId: item.itemId },
          attributes: [[fn('AVG', col('itemRating')), 'avgRating']]
        });
        await Food.update({ rating: avgItem[0].dataValues.avgRating }, { where: { id: item.itemId } });
      }
    }
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/restaurants/:restaurantId/reviews
router.get('/restaurants/:restaurantId/reviews', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;
    const reviews = await Review.findAndCountAll({
      where: { restaurantId },
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        { model: ItemReview, as: 'itemReviews' },
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });
    res.json({
      success: true,
      total: reviews.count,
      page: parseInt(page),
      limit: parseInt(limit),
      reviews: reviews.rows.map(r => ({
        id: r.id,
        user: r.user ? { id: r.user.id, name: r.user.username ? r.user.username[0] + '***' : 'Ẩn danh' } : 'Ẩn danh',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        itemReviews: r.itemReviews
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/items/:itemId/reviews
router.get('/items/:itemId/reviews', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10, sort = 'id', order = 'DESC' } = req.query;
    const itemReviews = await ItemReview.findAndCountAll({
      where: { itemId },
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        { model: Review, as: 'review', include: [{ model: User, as: 'user', attributes: ['id', 'username'] }] }
      ]
    });
    res.json({
      success: true,
      total: itemReviews.count,
      page: parseInt(page),
      limit: parseInt(limit),
      reviews: itemReviews.rows.map(ir => ({
        id: ir.id,
        user: ir.review && ir.review.user ? { id: ir.review.user.id, name: ir.review.user.username ? ir.review.user.username[0] + '***' : 'Ẩn danh' } : 'Ẩn danh',
        itemRating: ir.itemRating,
        itemComment: ir.itemComment,
        createdAt: ir.review ? ir.review.createdAt : null
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/me/reviews
router.get('/users/me/reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.findAll({
      where: { userId },
      include: [
        { model: ItemReview, as: 'itemReviews' },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
