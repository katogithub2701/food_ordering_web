const express = require('express');
const router = express.Router();
const { Order, OrderItem } = require('../models/Order');
const Food = require('../models/Food');
const User = require('../models/User');
const { Op } = require('sequelize');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * POST /api/orders
 * Tạo đơn hàng mới
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItems, deliveryAddress, notes, shippingFee = 0, totalAmount } = req.body;
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Thiếu thông tin giỏ hàng.' });
    }
    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.street) {
      return res.status(400).json({ message: 'Thiếu thông tin địa chỉ giao hàng.' });
    }
    // Kiểm tra sản phẩm còn hàng và tính lại tổng tiền
    let itemsTotal = 0;
    const orderItems = [];
    for (const item of cartItems) {
      const food = await Food.findByPk(item.foodId);
      if (!food) return res.status(400).json({ message: `Không tìm thấy món ăn với id ${item.foodId}` });
      // Có thể kiểm tra tồn kho ở đây nếu có
      const price = food.price;
      itemsTotal += price * item.quantity;
      orderItems.push({ foodId: food.id, quantity: item.quantity, price, note: item.note || '' });
    }
    // Tính tổng tiền cuối cùng
    const finalAmount = itemsTotal + (shippingFee || 0);
    if (totalAmount && Math.abs(finalAmount - totalAmount) > 1000) {
      return res.status(400).json({ message: 'Tổng tiền không khớp.' });
    }    // Lưu đơn hàng
    const order = await Order.create({
      userId,
      total: finalAmount,
      status: 'pending',
      deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.ward ? deliveryAddress.ward + ', ' : ''}${deliveryAddress.district}, ${deliveryAddress.city || deliveryAddress.province}`,
      contactPhone: deliveryAddress.phone,
      recipientName: deliveryAddress.fullName,
      customerNotes: notes || '',
      shippingFee: shippingFee || 0,
      paymentMethod: 'cash', // Default payment method
      createdAt: new Date(),
      updatedAt: new Date()
    });
    // Lưu từng món
    for (const item of orderItems) {
      await OrderItem.create({ ...item, orderId: order.id });
    }    // Lấy lại thông tin đơn hàng trả về
    const orderData = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'OrderItems' }]
    });
    res.status(201).json({
      orderId: order.id,
      total: finalAmount,
      status: order.status,
      createdAt: order.createdAt,
      items: orderItems
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

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
    const order = [[sortField, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];    // Get orders with pagination
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereConditions,
      include: [{
        model: OrderItem,
        as: 'OrderItems',
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
        as: 'OrderItems',
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
    });    // Calculate totals
    const itemsTotal = order.OrderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    const shippingFee = parseFloat(order.shippingFee || 0);
    const totalAmount = parseFloat(order.total);
    const discount = Math.max(0, itemsTotal + shippingFee - totalAmount);
    
    // Format response
    const formattedOrder = {
      id: order.id,
      total: totalAmount,
      totalAmount: itemsTotal, // Items subtotal
      deliveryFee: shippingFee,
      shippingFee: shippingFee,
      discount: discount,
      finalAmount: totalAmount, // Final total including shipping and discounts
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      date: order.createdAt, // Add date field for frontend compatibility
      deliveryAddress: order.deliveryAddress,
      contactPhone: order.contactPhone,
      recipientName: order.recipientName,
      customerNotes: order.customerNotes,
      paymentMethod: order.paymentMethod,
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
    res.status(500).json({
      success: false,
      error: 'UPDATE_STATUS_ERROR',
      message: 'Failed to update order status'
    });
  }
});

module.exports = router;
