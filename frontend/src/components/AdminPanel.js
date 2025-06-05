import React, { useState, useEffect } from 'react';
import { 
  getStatusLabel, 
  getStatusDescription, 
  getStatusIcon,
  ORDER_STATUS 
} from '../utils/orderStatus';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock admin orders data - in real app, fetch from API
  useEffect(() => {
    setTimeout(() => {
      const mockAdminOrders = [
        {
          id: 'DH001',
          customerId: 'KH123',
          customerName: 'Nguyễn Văn A',
          customerPhone: '0901234567',
          restaurantName: 'Nhà hàng Phố Huế',
          totalAmount: 285000,
          status: 'preparing',
          orderTime: '2025-06-04T14:30:00Z',
          deliveryAddress: '123 Đường Lê Lợi, Q1, TP.HCM',
          items: [
            { name: 'Bún bò Huế', quantity: 2, price: 65000 },
            { name: 'Chả cá Thăng Long', quantity: 1, price: 85000 }
          ]
        },
        {
          id: 'DH002',
          customerId: 'KH124',
          customerName: 'Trần Thị B',
          customerPhone: '0907654321',
          restaurantName: 'Pizza Hut',
          totalAmount: 450000,
          status: 'ready_for_pickup',
          orderTime: '2025-06-04T15:15:00Z',
          deliveryAddress: '456 Đường Nguyễn Huệ, Q1, TP.HCM',
          items: [
            { name: 'Pizza Margherita size L', quantity: 1, price: 299000 },
            { name: 'Coca Cola', quantity: 2, price: 25000 }
          ]
        },
        {
          id: 'DH003',
          customerId: 'KH125',
          customerName: 'Lê Văn C',
          customerPhone: '0912345678',
          restaurantName: 'KFC Vietnam',
          totalAmount: 195000,
          status: 'delivering',
          orderTime: '2025-06-04T16:00:00Z',
          deliveryAddress: '789 Đường Pasteur, Q3, TP.HCM',
          items: [
            { name: 'Gà rán phần', quantity: 1, price: 99000 },
            { name: 'Khoai tây chiên', quantity: 1, price: 35000 }
          ]
        }
      ];
      
      setOrders(mockAdminOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // In real app: API call to update status
      // await updateOrderStatus(orderId, newStatus);
        setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );    } catch (error) {
      // Error handling for order status update
    }
  };

  const getAvailableTransitions = (currentStatus) => {
    const transitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready_for_pickup', 'cancelled'],
      'ready_for_pickup': ['picked_up'],
      'picked_up': ['delivering'],
      'delivering': ['delivered', 'delivery_failed'],
      'delivered': ['completed'],
      'delivery_failed': ['returning', 'delivering'],
      'returning': ['returned'],
      'returned': ['refunded']
    };
    
    return transitions[currentStatus] || [];
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>🏪 Quản lý đơn hàng</h1>
        <div className="admin-stats">
          <div className="stat-item">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Tổng đơn</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {orders.filter(o => ['preparing', 'ready_for_pickup', 'picked_up', 'delivering'].includes(o.status)).length}
            </span>
            <span className="stat-label">Đang xử lý</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {orders.filter(o => o.status === 'completed').length}
            </span>
            <span className="stat-label">Hoàn thành</span>
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* Status Filter */}
        <div className="filter-section">
          <h3>Lọc theo trạng thái:</h3>
          <div className="status-filters">
            <button 
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Tất cả ({orders.length})
            </button>
            {Object.values(ORDER_STATUS).map(status => {
              const count = orders.filter(o => o.status === status).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={status}
                  className={`filter-btn status-${status} ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {getStatusIcon(status)} {getStatusLabel(status)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Nhà hàng</th>
                <th>Thời gian</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className={`order-row status-${order.status}`}>
                  <td>
                    <strong>{order.id}</strong>
                    <div className="customer-phone">{order.customerPhone}</div>
                  </td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.customerName}</strong>
                      <div className="delivery-address">{order.deliveryAddress}</div>
                    </div>
                  </td>
                  <td>{order.restaurantName}</td>
                  <td>{formatTime(order.orderTime)}</td>
                  <td className="amount">{order.totalAmount.toLocaleString()}₫</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => setSelectedOrder(order)}
                      >
                        👁️ Xem
                      </button>
                      <div className="status-actions">
                        {getAvailableTransitions(order.status).map(newStatus => (
                          <button
                            key={newStatus}
                            className={`btn-status status-${newStatus}`}
                            onClick={() => handleStatusUpdate(order.id, newStatus)}
                          >
                            {getStatusIcon(newStatus)} {getStatusLabel(newStatus)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="order-detail-grid">
                  <div className="detail-section">
                    <h3>Thông tin khách hàng</h3>
                    <p><strong>Tên:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Điện thoại:</strong> {selectedOrder.customerPhone}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.deliveryAddress}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Thông tin đơn hàng</h3>
                    <p><strong>Nhà hàng:</strong> {selectedOrder.restaurantName}</p>
                    <p><strong>Thời gian đặt:</strong> {formatTime(selectedOrder.orderTime)}</p>
                    <p><strong>Trạng thái:</strong> 
                      <span className={`status-badge status-${selectedOrder.status}`}>
                        {getStatusIcon(selectedOrder.status)} {getStatusLabel(selectedOrder.status)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Món ăn đã đặt</h3>
                  <div className="order-items-detail">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{(item.price * item.quantity).toLocaleString()}₫</span>
                      </div>
                    ))}
                    <div className="total-row">
                      <strong>Tổng cộng: {selectedOrder.totalAmount.toLocaleString()}₫</strong>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Cập nhật trạng thái</h3>
                  <div className="status-update-actions">
                    {getAvailableTransitions(selectedOrder.status).map(newStatus => (
                      <button
                        key={newStatus}
                        className={`btn-status-large status-${newStatus}`}
                        onClick={() => {
                          handleStatusUpdate(selectedOrder.id, newStatus);
                          setSelectedOrder({...selectedOrder, status: newStatus});
                        }}
                      >
                        {getStatusIcon(newStatus)} Chuyển sang "{getStatusLabel(newStatus)}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
