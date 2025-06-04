// OrderStatus Helper - Quản lý trạng thái đơn hàng
// filepath: d:\HOC\QLDA\food_ordering_web\frontend\src\utils\orderStatus.js

export const ORDER_STATUS = {
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

export const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PREPARING]: 'Đang chuẩn bị',
  [ORDER_STATUS.READY_FOR_PICKUP]: 'Sẵn sàng lấy hàng',
  [ORDER_STATUS.PICKED_UP]: 'Đã lấy hàng',
  [ORDER_STATUS.DELIVERING]: 'Đang giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
  [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS.DELIVERY_FAILED]: 'Giao hàng thất bại',
  [ORDER_STATUS.RETURNING]: 'Đang trả hàng',
  [ORDER_STATUS.RETURNED]: 'Đã trả hàng',
  [ORDER_STATUS.REFUNDED]: 'Đã hoàn tiền'
};

export const STATUS_DESCRIPTIONS = {
  [ORDER_STATUS.PENDING]: 'Đơn hàng của bạn đang chờ nhà hàng xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Nhà hàng đã xác nhận đơn hàng của bạn',
  [ORDER_STATUS.PREPARING]: 'Nhà hàng đang chuẩn bị món ăn của bạn',
  [ORDER_STATUS.READY_FOR_PICKUP]: 'Món ăn đã sẵn sàng, đang tìm tài xế giao hàng',
  [ORDER_STATUS.PICKED_UP]: 'Tài xế đã lấy hàng và chuẩn bị giao cho bạn',
  [ORDER_STATUS.DELIVERING]: 'Tài xế đang trên đường giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Đơn hàng đã được giao thành công',
  [ORDER_STATUS.COMPLETED]: 'Cảm ơn bạn đã sử dụng dịch vụ',
  [ORDER_STATUS.CANCELLED]: 'Đơn hàng đã bị hủy',
  [ORDER_STATUS.DELIVERY_FAILED]: 'Giao hàng thất bại, vui lòng liên hệ hỗ trợ',
  [ORDER_STATUS.RETURNING]: 'Đơn hàng đang được trả về nhà hàng',
  [ORDER_STATUS.RETURNED]: 'Đơn hàng đã được trả về nhà hàng',
  [ORDER_STATUS.REFUNDED]: 'Đã hoàn tiền thành công'
};

export const STATUS_ICONS = {
  [ORDER_STATUS.PENDING]: '⏰',
  [ORDER_STATUS.CONFIRMED]: '✅',
  [ORDER_STATUS.PREPARING]: '👨‍🍳',
  [ORDER_STATUS.READY_FOR_PICKUP]: '📦',
  [ORDER_STATUS.PICKED_UP]: '🚚',
  [ORDER_STATUS.DELIVERING]: '🛵',
  [ORDER_STATUS.DELIVERED]: '✅',
  [ORDER_STATUS.COMPLETED]: '🎉',
  [ORDER_STATUS.CANCELLED]: '❌',
  [ORDER_STATUS.DELIVERY_FAILED]: '⚠️',
  [ORDER_STATUS.RETURNING]: '↩️',
  [ORDER_STATUS.RETURNED]: '📤',
  [ORDER_STATUS.REFUNDED]: '💰'
};

// Trạng thái đang hoạt động (đơn hàng đang xử lý)
export const ACTIVE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.DELIVERING
];

// Trạng thái đã hoàn thành
export const COMPLETED_STATUSES = [
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.COMPLETED
];

// Trạng thái đã hủy/thất bại
export const CANCELLED_STATUSES = [
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.DELIVERY_FAILED,
  ORDER_STATUS.RETURNING,
  ORDER_STATUS.RETURNED,
  ORDER_STATUS.REFUNDED
];

// Luồng chuyển đổi trạng thái hợp lệ
export const STATUS_TRANSITIONS = {
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
  [ORDER_STATUS.COMPLETED]: [], // Trạng thái cuối
  [ORDER_STATUS.REFUNDED]: [] // Trạng thái cuối
};

// Thời gian timeout cho từng trạng thái (tính bằng phút)
export const STATUS_TIMEOUTS = {
  [ORDER_STATUS.PENDING]: 15,
  [ORDER_STATUS.CONFIRMED]: 5,
  [ORDER_STATUS.PREPARING]: 45,
  [ORDER_STATUS.READY_FOR_PICKUP]: 30,
  [ORDER_STATUS.PICKED_UP]: 10,
  [ORDER_STATUS.DELIVERING]: 60
};

// Utility functions
export const getStatusLabel = (status) => STATUS_LABELS[status] || 'Không xác định';

export const getStatusDescription = (status) => STATUS_DESCRIPTIONS[status] || '';

export const getStatusIcon = (status) => STATUS_ICONS[status] || '❓';

export const isActiveStatus = (status) => ACTIVE_STATUSES.includes(status);

export const isCompletedStatus = (status) => COMPLETED_STATUSES.includes(status);

export const isCancelledStatus = (status) => CANCELLED_STATUSES.includes(status);

export const canTransitionTo = (fromStatus, toStatus) => {
  const validTransitions = STATUS_TRANSITIONS[fromStatus] || [];
  return validTransitions.includes(toStatus);
};

export const getValidNextStatuses = (currentStatus) => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};

export const getStatusTimeout = (status) => {
  return STATUS_TIMEOUTS[status];
};

// Tính toán tiến trình đơn hàng (%)
export const getOrderProgress = (status) => {
  const progressMap = {
    [ORDER_STATUS.PENDING]: 10,
    [ORDER_STATUS.CONFIRMED]: 20,
    [ORDER_STATUS.PREPARING]: 40,
    [ORDER_STATUS.READY_FOR_PICKUP]: 60,
    [ORDER_STATUS.PICKED_UP]: 70,
    [ORDER_STATUS.DELIVERING]: 85,
    [ORDER_STATUS.DELIVERED]: 95,
    [ORDER_STATUS.COMPLETED]: 100,
    [ORDER_STATUS.CANCELLED]: 0,
    [ORDER_STATUS.DELIVERY_FAILED]: 0,
    [ORDER_STATUS.RETURNING]: 30,
    [ORDER_STATUS.RETURNED]: 60,
    [ORDER_STATUS.REFUNDED]: 100
  };
  
  return progressMap[status] || 0;
};

// Lấy màu sắc cho trạng thái
export const getStatusColor = (status) => {
  const colorMap = {
    [ORDER_STATUS.PENDING]: '#ffa726',
    [ORDER_STATUS.CONFIRMED]: '#4caf50',
    [ORDER_STATUS.PREPARING]: '#42a5f5',
    [ORDER_STATUS.READY_FOR_PICKUP]: '#ab47bc',
    [ORDER_STATUS.PICKED_UP]: '#29b6f6',
    [ORDER_STATUS.DELIVERING]: '#ab47bc',
    [ORDER_STATUS.DELIVERED]: '#4caf50',
    [ORDER_STATUS.COMPLETED]: '#66bb6a',
    [ORDER_STATUS.CANCELLED]: '#ef5350',
    [ORDER_STATUS.DELIVERY_FAILED]: '#ffa726',
    [ORDER_STATUS.RETURNING]: '#e91e63',
    [ORDER_STATUS.RETURNED]: '#8bc34a',
    [ORDER_STATUS.REFUNDED]: '#26a69a'
  };
  
  return colorMap[status] || '#666';
};

// Kiểm tra xem khách hàng có thể hủy đơn không
export const canCustomerCancel = (status) => {
  return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(status);
};

// Kiểm tra xem có thể đánh giá đơn hàng không
export const canRate = (status) => {
  return status === ORDER_STATUS.DELIVERED;
};

// Kiểm tra xem có thể đặt lại đơn hàng không
export const canReorder = (status) => {
  return [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(status);
};
