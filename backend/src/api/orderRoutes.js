const express = require('express');
const { Op } = require('sequelize');
const { Order, OrderItem } = require('../models/Order');
const Food = require('../models/Food');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/orders
 * Get user's order list with pagination, filtering, and sorting
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const whereConditions = {
      userId: req.user.id
    };

    // Filter by status
    if (status) {
      whereConditions.status = status;
    }

    // Filter by date range
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

    // Get orders with pagination
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereConditions,
      include: [{
        model: OrderItem,
        include: [{
          model: Food,
          attributes: ['id', 'name', 'imageUrl']
        }]
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
      itemCount: order.OrderItems.length,
      items: order.OrderItems.map(item => ({
        id: item.id,
        foodId: item.foodId,
        foodName: item.Food?.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        imageUrl: item.Food?.imageUrl
      }))
    }));

    // Calculate pagination metadata
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
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ORDERS_ERROR',
      message: 'Failed to fetch orders'
    });
  }
});

/**
 * GET /api/orders/:orderId
 * Get detailed order information including status history
 */
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find order with full details
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id // Ensure user can only access their own orders
      },
      include: [{
        model: OrderItem,
        include: [{
          model: Food,
          attributes: ['id', 'name', 'description', 'imageUrl']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found'
      });
    }

    // Get status history
    const statusHistory = await OrderStatusHistory.findAll({
      where: { orderId },
      order: [['createdAt', 'ASC']]
    });

    // Format response
    const formattedOrder = {
      id: order.id,
      total: parseFloat(order.total),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.OrderItems.map(item => ({
        id: item.id,
        foodId: item.foodId,
        foodName: item.Food?.name,
        foodDescription: item.Food?.description,
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.price) * item.quantity,
        imageUrl: item.Food?.imageUrl
      })),
      statusHistory: statusHistory.map(history => ({
        id: history.id,
        fromStatus: history.fromStatus,
        toStatus: history.toStatus,
        note: history.note,
        changedAt: history.createdAt,
        changedBy: history.changedBy
      }))
    };

    res.json({
      success: true,
      data: formattedOrder
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ORDER_ERROR',
      message: 'Failed to fetch order details'
    });
  }
});

/**
 * PUT /api/orders/internal/:orderId/status
 * Update order status (for admin/restaurant use)
 */
router.put('/internal/:orderId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'STATUS_REQUIRED',
        message: 'Status is required'
      });
    }

    // Valid order statuses
    const validStatuses = [
      'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery',
      'delivered', 'cancelled', 'refunded', 'failed', 'on_hold',
      'pickup_ready', 'picked_up', 'returned'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Invalid order status',
        validStatuses
      });
    }

    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;

    // Prevent unnecessary updates
    if (oldStatus === status) {
      return res.status(400).json({
        success: false,
        error: 'STATUS_UNCHANGED',
        message: 'Order already has this status'
      });
    }

    // Update order status
    await order.update({ status });

    // Create status history record
    await OrderStatusHistory.create({
      orderId: order.id,
      fromStatus: oldStatus,
      toStatus: status,
      note: note || `Status changed by ${req.user.username}`,
      changedBy: req.user.username
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        oldStatus,
        newStatus: status,
        updatedAt: order.updatedAt
      },
      message: 'Order status updated successfully'
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

module.exports = router;
