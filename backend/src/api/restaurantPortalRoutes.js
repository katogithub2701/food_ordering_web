const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Order, OrderItem } = require('../models/Order');
const Food = require('../models/Food');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const { Op } = require('sequelize');

// Middleware to check if user is a restaurant user
const requireRestaurantRole = (req, res, next) => {
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ 
      error: 'RESTAURANT_ACCESS_REQUIRED',
      message: 'Restaurant access required' 
    });
  }
  next();
};

// GET /api/restaurant-portal/orders
// Get orders for the restaurant
router.get('/orders', authenticateToken, requireRestaurantRole, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Get restaurant ID from user
    const restaurantId = req.user.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any restaurant'
      });
    }

    // Build where conditions for orders that contain items from this restaurant
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }

    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) {
        whereConditions.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereConditions.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Build order clause
    const validSortFields = ['createdAt', 'updatedAt', 'total', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];

    // Get orders that contain items from this restaurant
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereConditions,
      include: [{
        model: OrderItem,
        include: [{
          model: Food,
          where: { restaurantId: restaurantId },
          attributes: ['id', 'name', 'imageUrl', 'restaurantId']
        }],
        required: true // Only include orders that have items from this restaurant
      }, {
        model: User,
        attributes: ['id', 'username', 'email']
      }],
      order,
      limit: limitNum,
      offset,
      distinct: true
    });

    // Format response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      total: parseFloat(order.total),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deliveryAddress: order.deliveryAddress,
      contactPhone: order.contactPhone,
      recipientName: order.recipientName,
      customerNotes: order.customerNotes,
      paymentMethod: order.paymentMethod,
      customer: {
        id: order.User?.id,
        username: order.User?.username,
        email: order.User?.email
      },
      items: order.OrderItems
        .filter(item => item.Food && item.Food.restaurantId === restaurantId)
        .map(item => ({
          id: item.id,
          foodId: item.foodId,
          foodName: item.Food?.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          imageUrl: item.Food?.imageUrl
        }))
    }));

    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPreviousPage
        },
        filters: {
          status,
          startDate,
          endDate,
          sortBy: sortField,
          sortOrder: sortOrder.toUpperCase()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ORDERS_ERROR',
      message: 'Failed to fetch orders'
    });
  }
});

// PUT /api/restaurant-portal/orders/:orderId/status
// Update order status
router.put('/orders/:orderId/status', authenticateToken, requireRestaurantRole, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    const restaurantId = req.user.restaurantId;

    // Validate status
    const validStatuses = [
      'pending', 'confirmed', 'preparing', 'ready_for_pickup',
      'picked_up', 'delivering', 'delivered', 'completed', 'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Invalid order status'
      });
    }

    // Find the order and verify it belongs to this restaurant
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{
        model: OrderItem,
        include: [{
          model: Food,
          where: { restaurantId: restaurantId },
          required: true
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found or does not belong to this restaurant'
      });
    }

    const oldStatus = order.status;

    // Update order status
    await order.update({ status });

    // Log status change
    await OrderStatusHistory.create({
      orderId: order.id,
      fromStatus: oldStatus,
      toStatus: status,
      note: note || 'Status updated by restaurant',
      changedBy: `restaurant_${req.user.username}`
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order.id,
        oldStatus,
        newStatus: status,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_STATUS_ERROR',
      message: 'Failed to update order status'
    });
  }
});

// GET /api/restaurant-portal/foods
// Get food items for the restaurant
router.get('/foods', authenticateToken, requireRestaurantRole, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      availability,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const restaurantId = req.user.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any restaurant'
      });
    }

    // Build where conditions
    const whereConditions = { restaurantId };

    if (category && category !== 'all') {
      whereConditions.category = category;
    }

    if (availability !== undefined) {
      whereConditions.isAvailable = availability === 'true';
    }

    // Build order clause
    const validSortFields = ['name', 'price', 'category', 'createdAt', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = [[sortField, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];

    const { count, rows: foods } = await Food.findAndCountAll({
      where: whereConditions,
      order,
      limit: limitNum,
      offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      data: {
        foods: foods.map(food => ({
          id: food.id,
          name: food.name,
          description: food.description,
          price: food.price,
          category: food.category,
          isAvailable: food.isAvailable,
          rating: food.rating,
          imageUrl: food.imageUrl,
          createdAt: food.createdAt,
          updatedAt: food.updatedAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant foods:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FOODS_ERROR',
      message: 'Failed to fetch foods'
    });
  }
});

// POST /api/restaurant-portal/foods
// Add new food item
router.post('/foods', authenticateToken, requireRestaurantRole, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, isAvailable } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any restaurant'
      });
    }

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, category'
      });
    }

    // Validate price
    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    const food = await Food.create({
      name,
      description,
      price: parseFloat(price),
      category,
      imageUrl: imageUrl || null,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      restaurantId: restaurantId,
      rating: 0 // Default rating
    });

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: food
    });
  } catch (error) {
    console.error('Error creating food item:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'CREATE_FOOD_ERROR',
      message: 'Failed to create food item'
    });
  }
});

// PUT /api/restaurant-portal/foods/:foodId
// Update food item
router.put('/foods/:foodId', authenticateToken, requireRestaurantRole, async (req, res) => {
  try {
    const { foodId } = req.params;
    const { name, description, price, category, imageUrl, isAvailable } = req.body;
    const restaurantId = req.user.restaurantId;

    const food = await Food.findOne({
      where: { id: foodId, restaurantId: restaurantId }
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'FOOD_NOT_FOUND',
        message: 'Food item not found or does not belong to this restaurant'
      });
    }

    // Validate price if provided
    if (price !== undefined && (isNaN(price) || parseFloat(price) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    await food.update(updateData);

    res.json({
      success: true,
      message: 'Food item updated successfully',
      data: food
    });
  } catch (error) {
    console.error('Error updating food item:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'UPDATE_FOOD_ERROR',
      message: 'Failed to update food item'
    });
  }
});

// DELETE /api/restaurant-portal/foods/:foodId
// Delete food item
router.delete('/foods/:foodId', authenticateToken, requireRestaurantRole, async (req, res) => {
  try {
    const { foodId } = req.params;
    const restaurantId = req.user.restaurantId;

    const food = await Food.findOne({
      where: { id: foodId, restaurantId: restaurantId }
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'FOOD_NOT_FOUND',
        message: 'Food item not found or does not belong to this restaurant'
      });
    }

    await food.destroy();

    res.json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_FOOD_ERROR',
      message: 'Failed to delete food item'
    });
  }
});

// GET /api/restaurant-portal/dashboard
// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireRestaurantRole, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any restaurant'
      });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get statistics
    const [newOrdersCount, totalFoodsCount, todayOrdersCount, totalRevenue] = await Promise.all([
      // New orders (pending and confirmed)
      Order.count({
        include: [{
          model: OrderItem,
          include: [{
            model: Food,
            where: { restaurantId: restaurantId },
            required: true
          }],
          required: true
        }],
        where: {
          status: { [Op.in]: ['pending', 'confirmed'] }
        }
      }),
      
      // Total food items
      Food.count({
        where: { restaurantId: restaurantId }
      }),
      
      // Today's orders
      Order.count({
        include: [{
          model: OrderItem,
          include: [{
            model: Food,
            where: { restaurantId: restaurantId },
            required: true
          }],
          required: true
        }],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          }
        }
      }),
      
      // Total revenue (completed orders)
      Order.sum('total', {
        include: [{
          model: OrderItem,
          include: [{
            model: Food,
            where: { restaurantId: restaurantId },
            required: true
          }],
          required: true
        }],
        where: {
          status: { [Op.in]: ['completed', 'delivered'] }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        newOrders: newOrdersCount || 0,
        totalFoods: totalFoodsCount || 0,
        todayOrders: todayOrdersCount || 0,
        totalRevenue: totalRevenue || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_DASHBOARD_ERROR',
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

module.exports = router;
