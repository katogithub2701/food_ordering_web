const { Order } = require('../models/Order');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const { Op } = require('sequelize');

// Định nghĩa các trạng thái hợp lệ và luồng chuyển đổi
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  PICKED_UP: 'picked_up',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELIVERY_FAILED: 'delivery_failed',
  RETURNING: 'returning',
  RETURNED: 'returned',
  REFUNDED: 'refunded'
};

// Luồng chuyển đổi trạng thái hợp lệ
const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY_FOR_PICKUP]: [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.DELIVERING],
  [ORDER_STATUS.DELIVERING]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.DELIVERY_FAILED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.DELIVERY_FAILED]: [ORDER_STATUS.RETURNING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.RETURNING]: [ORDER_STATUS.RETURNED],
  [ORDER_STATUS.RETURNED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.REFUNDED]: []
};

// Quyền hạn thay đổi trạng thái
const STATUS_PERMISSIONS = {
  customer: {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.DELIVERING]: [ORDER_STATUS.DELIVERED]
  },
  restaurant: {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.CANCELLED]
  },
  driver: {
    [ORDER_STATUS.READY_FOR_PICKUP]: [ORDER_STATUS.PICKED_UP],
    [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.DELIVERING],
    [ORDER_STATUS.DELIVERING]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.DELIVERY_FAILED],
    [ORDER_STATUS.DELIVERY_FAILED]: [ORDER_STATUS.RETURNING],
    [ORDER_STATUS.RETURNING]: [ORDER_STATUS.RETURNED]
  },
  system: {
    [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.RETURNED]: [ORDER_STATUS.REFUNDED],
    [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.REFUNDED]
  },
  admin: {} // Admin có thể thay đổi mọi trạng thái
};

class OrderStatusService {
  
  /**
   * Kiểm tra xem có thể chuyển từ trạng thái này sang trạng thái khác không
   * @param {string} fromStatus - Trạng thái hiện tại
   * @param {string} toStatus - Trạng thái muốn chuyển đến
   * @returns {boolean}
   */
  static canTransition(fromStatus, toStatus) {
    const validTransitions = STATUS_TRANSITIONS[fromStatus] || [];
    return validTransitions.includes(toStatus);
  }
  /**
   * Kiểm tra quyền hạn thay đổi trạng thái
   * @param {string} userRole - Vai trò người dùng (customer, restaurant, driver, system, admin)
   * @param {string} fromStatus - Trạng thái hiện tại
   * @param {string} toStatus - Trạng thái muốn chuyển đến
   * @returns {boolean}
   */
  static hasPermission(userRole, fromStatus, toStatus) {
    console.log('=== hasPermission Debug ===');
    console.log('userRole:', userRole);
    console.log('fromStatus:', fromStatus);
    console.log('toStatus:', toStatus);
    
    if (userRole === 'admin') {
      const canTransition = this.canTransition(fromStatus, toStatus);
      console.log('Admin permission check - canTransition:', canTransition);
      return canTransition;
    }

    const userPermissions = STATUS_PERMISSIONS[userRole] || {};
    console.log('userPermissions:', userPermissions);
    
    const allowedTransitions = userPermissions[fromStatus] || [];
    console.log('allowedTransitions for', fromStatus, ':', allowedTransitions);
    
    const hasTransitionPermission = allowedTransitions.includes(toStatus);
    console.log('hasTransitionPermission:', hasTransitionPermission);
    
    const canTransition = this.canTransition(fromStatus, toStatus);
    console.log('canTransition:', canTransition);
    
    const result = hasTransitionPermission && canTransition;
    console.log('Final result:', result);
    console.log('=== End hasPermission Debug ===');
    
    return result;
  }
  /**
   * Cập nhật trạng thái đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @param {string} newStatus - Trạng thái mới
   * @param {string} changedBy - Vai trò người thay đổi
   * @param {number} changedById - ID người thay đổi
   * @param {string} reason - Lý do thay đổi
   * @param {string} notes - Ghi chú
   * @returns {Promise<Object>}
   */
  static async updateOrderStatus(orderId, newStatus, changedBy, changedById = null, reason = null, notes = null) {
    try {
      console.log('=== updateOrderStatus Debug ===');
      console.log('orderId:', orderId);
      console.log('newStatus:', newStatus);
      console.log('changedBy:', changedBy);
      console.log('changedById:', changedById);
      console.log('reason:', reason);
      console.log('notes:', notes);
      
      // Lấy thông tin đơn hàng hiện tại
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
      }

      const currentStatus = order.status;
      console.log('currentStatus from DB:', currentStatus);

      // Kiểm tra quyền hạn
      if (!this.hasPermission(changedBy, currentStatus, newStatus)) {
        throw new Error(`Không có quyền chuyển từ trạng thái "${currentStatus}" sang "${newStatus}"`);
      }

      // Cập nhật trạng thái đơn hàng
      await order.update({
        status: newStatus,
        updatedAt: new Date()
      });

      // Lưu lịch sử thay đổi trạng thái
      await OrderStatusHistory.create({
        orderId: orderId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedBy: changedBy,
        changedById: changedById,
        reason: reason,
        notes: notes,
        timestamp: new Date()
      });

      // Gửi thông báo (sẽ implement sau)
      await this.sendStatusNotification(order, currentStatus, newStatus);

      return {
        success: true,
        order: order,
        message: `Đã cập nhật trạng thái từ "${currentStatus}" sang "${newStatus}"`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy lịch sử thay đổi trạng thái của đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Array>}
   */
  static async getOrderStatusHistory(orderId) {
    try {
      const history = await OrderStatusHistory.findAll({
        where: { orderId: orderId },
        order: [['timestamp', 'ASC']]
      });

      return history;
    } catch (error) {
      throw new Error('Không thể lấy lịch sử trạng thái đơn hàng');
    }
  }

  /**
   * Gửi thông báo khi trạng thái thay đổi
   * @param {Object} order - Đối tượng đơn hàng
   * @param {string} fromStatus - Trạng thái cũ
   * @param {string} toStatus - Trạng thái mới
   */  static async sendStatusNotification(order, fromStatus, toStatus) {
    // TODO: Implement notification system
    // - Push notification
    // - Email
    // - SMS
    // - WebSocket real-time update
  }

  /**
   * Lấy danh sách trạng thái có thể chuyển đến
   * @param {string} currentStatus - Trạng thái hiện tại
   * @param {string} userRole - Vai trò người dùng
   * @returns {Array}
   */
  static getAvailableTransitions(currentStatus, userRole) {
    if (userRole === 'admin') {
      return STATUS_TRANSITIONS[currentStatus] || [];
    }

    const userPermissions = STATUS_PERMISSIONS[userRole] || {};
    const allowedTransitions = userPermissions[currentStatus] || [];
    
    return allowedTransitions.filter(status => 
      this.canTransition(currentStatus, status)
    );
  }

  /**
   * Tự động hủy đơn hàng quá hạn
   */
  static async cancelExpiredOrders() {
    try {
      const timeoutMinutes = 15; // 15 phút timeout cho đơn hàng pending
      const expiredTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

      const expiredOrders = await Order.findAll({        where: {
          status: ORDER_STATUS.PENDING,
          createdAt: {
            [Op.lt]: expiredTime
          }
        }
      });

      for (const order of expiredOrders) {
        await this.updateOrderStatus(
          order.id,
          ORDER_STATUS.CANCELLED,
          'system',
          null,
          'Đơn hàng quá hạn xác nhận',
          'Tự động hủy sau 15 phút không được xác nhận'
        );
      }

      return expiredOrders.length;    } catch (error) {
      return 0;
    }
  }

  /**
   * Tự động hoàn thành đơn hàng đã giao
   */
  static async completeDeliveredOrders() {
    try {
      const timeoutHours = 24; // 24 giờ tự động hoàn thành
      const expiredTime = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);

      const deliveredOrders = await Order.findAll({        where: {
          status: ORDER_STATUS.DELIVERED,
          updatedAt: {
            [Op.lt]: expiredTime
          }
        }
      });

      for (const order of deliveredOrders) {
        await this.updateOrderStatus(
          order.id,
          ORDER_STATUS.COMPLETED,
          'system',
          null,
          'Tự động hoàn thành sau 24 giờ',
          'Đơn hàng được hoàn thành tự động sau 24 giờ giao hàng'
        );
      }

      return deliveredOrders.length;    } catch (error) {
      return 0;
    }
  }
}

module.exports = {
  OrderStatusService,
  ORDER_STATUS,
  STATUS_TRANSITIONS,
  STATUS_PERMISSIONS
};
