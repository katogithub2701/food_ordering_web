import React from 'react';
import { 
  getStatusLabel, 
  getStatusDescription, 
  getStatusIcon,
  getOrderProgress,
  getStatusColor,
  isActiveStatus,
  canCustomerCancel,
  canRate,
  canReorder
} from '../utils/orderStatus';
import '../styles/OrderTracking.css';

function OrderStatusDetail({ order, onCancel, onRate, onReorder, onTrackOrder }) {
  const progress = getOrderProgress(order.status);
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);
  const statusLabel = getStatusLabel(order.status);
  const statusDescription = getStatusDescription(order.status);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancel = () => {
    if (canCustomerCancel(order.status) && onCancel) {
      onCancel(order);
    }
  };

  const handleRate = () => {
    if (canRate(order.status) && onRate) {
      onRate(order);
    }
  };

  const handleReorder = () => {
    if (canReorder(order.status) && onReorder) {
      onReorder(order);
    }
  };

  const handleTrackOrder = () => {
    if (isActiveStatus(order.status) && onTrackOrder) {
      onTrackOrder(order);
    }
  };

  return (
    <div className="order-status-detail">
      {/* Header với thông tin cơ bản */}
      <div className="order-detail-header">
        <div className="order-info">
          <div className="order-id-date">
            <h2>Đơn hàng #{order.id}</h2>
            <p className="order-date">{formatDate(order.date)}</p>
          </div>
          <div className="restaurant-info">
            <span className="restaurant-logo">{order.restaurantLogo}</span>
            <span className="restaurant-name">{order.restaurantName}</span>
          </div>
        </div>
        
        <div className="status-summary">
          <div className="status-badge-large" style={{ backgroundColor: statusColor + '20', color: statusColor }}>
            <span className="status-icon">{statusIcon}</span>
            <span className="status-text">{statusLabel}</span>
          </div>
          <div className="total-amount-large">
            {order.totalAmount.toLocaleString()}₫
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="order-progress-section">
        <div className="progress-header">
          <h3>Tiến trình đơn hàng</h3>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: statusColor
            }}
          ></div>
        </div>
        <div className="status-description">
          {statusDescription}
        </div>
      </div>

      {/* Chi tiết món ăn */}
      <div className="order-items-section">
        <h3>Chi tiết đơn hàng</h3>
        <div className="items-list">
          {order.items.map((item, index) => (
            <div key={index} className="order-item-detail">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
              <div className="item-price">
                {(item.price * item.quantity).toLocaleString()}₫
              </div>
            </div>
          ))}
        </div>
        
        <div className="order-summary">
          <div className="summary-row">
            <span>Tổng cộng ({order.items.length} món)</span>
            <span className="total-price">{order.totalAmount.toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="order-actions">
        {isActiveStatus(order.status) && (
          <button 
            className="btn btn-primary"
            onClick={handleTrackOrder}
          >
            <span>📍</span> Theo dõi đơn hàng
          </button>
        )}
        
        {canCustomerCancel(order.status) && (
          <button 
            className="btn btn-danger"
            onClick={handleCancel}
          >
            <span>❌</span> Hủy đơn hàng
          </button>
        )}
        
        {canRate(order.status) && (
          <button 
            className="btn btn-warning"
            onClick={handleRate}
          >
            <span>⭐</span> Đánh giá
          </button>
        )}
        
        {canReorder(order.status) && (
          <button 
            className="btn btn-secondary"
            onClick={handleReorder}
          >
            <span>🔄</span> Đặt lại
          </button>
        )}
      </div>

      {/* Timeline (nếu cần thiết) */}
      {isActiveStatus(order.status) && (
        <div className="order-timeline">
          <h3>Lịch trình giao hàng</h3>
          <div className="timeline-steps">
            <div className={`timeline-step ${['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'delivering'].includes(order.status) ? 'completed' : ''}`}>
              <div className="step-icon">📝</div>
              <div className="step-content">
                <div className="step-title">Đơn hàng đã được tạo</div>
                <div className="step-time">Vừa xong</div>
              </div>
            </div>
            
            <div className={`timeline-step ${['confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'delivering'].includes(order.status) ? 'completed' : order.status === 'pending' ? 'current' : ''}`}>
              <div className="step-icon">✅</div>
              <div className="step-content">
                <div className="step-title">Nhà hàng xác nhận</div>
                <div className="step-time">Dự kiến: 5-10 phút</div>
              </div>
            </div>
            
            <div className={`timeline-step ${['preparing', 'ready_for_pickup', 'picked_up', 'delivering'].includes(order.status) ? 'completed' : order.status === 'confirmed' ? 'current' : ''}`}>
              <div className="step-icon">👨‍🍳</div>
              <div className="step-content">
                <div className="step-title">Chuẩn bị món ăn</div>
                <div className="step-time">Dự kiến: 15-25 phút</div>
              </div>
            </div>
            
            <div className={`timeline-step ${['ready_for_pickup', 'picked_up', 'delivering'].includes(order.status) ? 'completed' : order.status === 'preparing' ? 'current' : ''}`}>
              <div className="step-icon">📦</div>
              <div className="step-content">
                <div className="step-title">Chờ tài xế lấy hàng</div>
                <div className="step-time">Dự kiến: 5-10 phút</div>
              </div>
            </div>
            
            <div className={`timeline-step ${['picked_up', 'delivering'].includes(order.status) ? 'completed' : order.status === 'ready_for_pickup' ? 'current' : ''}`}>
              <div className="step-icon">🚚</div>
              <div className="step-content">
                <div className="step-title">Tài xế đã lấy hàng</div>
                <div className="step-time">Đang thực hiện</div>
              </div>
            </div>
            
            <div className={`timeline-step ${order.status === 'delivering' ? 'current' : ''}`}>
              <div className="step-icon">🛵</div>
              <div className="step-content">
                <div className="step-title">Đang giao hàng</div>
                <div className="step-time">Dự kiến: 15-20 phút</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderStatusDetail;
