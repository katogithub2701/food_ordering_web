const express = require('express');
const router = express.Router();
const { OrderStatusService, ORDER_STATUS } = require('../services/orderStatusService');
const { Order } = require('../models/Order');
const OrderStatusHistory = require('../models/OrderStatusHistory');

/**
 * GET /api/orders/:orderId/status
 * Lấy trạng thái hiện tại của đơn hàng
 */
router.get('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findByPk(orderId, {
      attributes: ['id', 'status', 'createdAt', 'updatedAt']
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

/**
 * PUT /api/orders/:orderId/status
 * Cập nhật trạng thái đơn hàng
 * Body: { status, changedBy, changedById?, reason?, notes? }
 */
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, changedBy, changedById, reason, notes } = req.body;

    // Validate input
    if (!status || !changedBy) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin status hoặc changedBy'
      });
    }

    // Validate status value
    const validStatuses = Object.values(ORDER_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
        validStatuses: validStatuses
      });
    }

    // Validate changedBy role
    const validRoles = ['customer', 'restaurant', 'driver', 'system', 'admin'];
    if (!validRoles.includes(changedBy)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ',
        validRoles: validRoles
      });
    }

    const result = await OrderStatusService.updateOrderStatus(
      parseInt(orderId),
      status,
      changedBy,
      changedById ? parseInt(changedById) : null,
      reason,
      notes
    );

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          orderId: result.order.id,
          status: result.order.status,
          updatedAt: result.order.updatedAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

/**
 * GET /api/orders/:orderId/status/history
 * Lấy lịch sử thay đổi trạng thái của đơn hàng
 */
router.get('/:orderId/status/history', async (req, res) => {
  try {
    const { orderId } = req.params;

    const history = await OrderStatusService.getOrderStatusHistory(parseInt(orderId));

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

/**
 * GET /api/orders/:orderId/status/transitions
 * Lấy danh sách trạng thái có thể chuyển đến
 * Query: ?role=customer|restaurant|driver|system|admin
 */
router.get('/:orderId/status/transitions', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { role = 'customer' } = req.query;

    const order = await Order.findByPk(orderId, {
      attributes: ['id', 'status']
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const availableTransitions = OrderStatusService.getAvailableTransitions(
      order.status,
      role
    );

    res.json({
      success: true,
      data: {
        currentStatus: order.status,
        availableTransitions: availableTransitions,
        role: role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

/**
 * GET /api/orders/status/definitions
 * Lấy định nghĩa tất cả trạng thái
 */
router.get('/status/definitions', (req, res) => {
  const statusDefinitions = {
    [ORDER_STATUS.PENDING]: {
      label: 'Chờ xác nhận',
      description: 'Đơn hàng của bạn đang chờ nhà hàng xác nhận',
      color: '#ffa726',
      icon: '⏰'
    },
    [ORDER_STATUS.CONFIRMED]: {
      label: 'Đã xác nhận',
      description: 'Nhà hàng đã xác nhận đơn hàng của bạn',
      color: '#4caf50',
      icon: '✅'
    },
    [ORDER_STATUS.PREPARING]: {
      label: 'Đang chuẩn bị',
      description: 'Nhà hàng đang chuẩn bị món ăn của bạn',
      color: '#42a5f5',
      icon: '👨‍🍳'
    },
    [ORDER_STATUS.READY_FOR_PICKUP]: {
      label: 'Sẵn sàng lấy hàng',
      description: 'Món ăn đã sẵn sàng, đang tìm tài xế giao hàng',
      color: '#ab47bc',
      icon: '📦'
    },
    [ORDER_STATUS.PICKED_UP]: {
      label: 'Đã lấy hàng',
      description: 'Tài xế đã lấy hàng và chuẩn bị giao cho bạn',
      color: '#29b6f6',
      icon: '🚚'
    },
    [ORDER_STATUS.DELIVERING]: {
      label: 'Đang giao hàng',
      description: 'Tài xế đang trên đường giao hàng',
      color: '#ab47bc',
      icon: '🛵'
    },
    [ORDER_STATUS.DELIVERED]: {
      label: 'Đã giao hàng',
      description: 'Đơn hàng đã được giao thành công',
      color: '#4caf50',
      icon: '✅'
    },
    [ORDER_STATUS.COMPLETED]: {
      label: 'Hoàn thành',
      description: 'Cảm ơn bạn đã sử dụng dịch vụ',
      color: '#66bb6a',
      icon: '🎉'
    },
    [ORDER_STATUS.CANCELLED]: {
      label: 'Đã hủy',
      description: 'Đơn hàng đã bị hủy',
      color: '#ef5350',
      icon: '❌'
    },
    [ORDER_STATUS.DELIVERY_FAILED]: {
      label: 'Giao hàng thất bại',
      description: 'Giao hàng thất bại, vui lòng liên hệ hỗ trợ',
      color: '#ffa726',
      icon: '⚠️'
    },
    [ORDER_STATUS.RETURNING]: {
      label: 'Đang trả hàng',
      description: 'Đơn hàng đang được trả về nhà hàng',
      color: '#e91e63',
      icon: '↩️'
    },
    [ORDER_STATUS.RETURNED]: {
      label: 'Đã trả hàng',
      description: 'Đơn hàng đã được trả về nhà hàng',
      color: '#8bc34a',
      icon: '📤'
    },
    [ORDER_STATUS.REFUNDED]: {
      label: 'Đã hoàn tiền',
      description: 'Đã hoàn tiền thành công',
      color: '#26a69a',
      icon: '💰'
    }
  };

  res.json({
    success: true,
    data: statusDefinitions
  });
});

module.exports = router;
