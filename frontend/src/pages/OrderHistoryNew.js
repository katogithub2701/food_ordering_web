import React, { useState, useEffect } from 'react';
import '../styles/OrderTracking.css';

function OrderHistory({ user, onOrderClick, onBackToHome }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      const mockOrders = [
        {
          id: 'DH001',
          date: '2025-06-04T10:30:00Z',
          restaurantName: 'Nhà hàng Phố Huế',
          restaurantLogo: '🍜',
          totalAmount: 285000,
          status: 'completed',
          statusText: 'Hoàn thành',
          items: [
            { name: 'Bún bò Huế', quantity: 2, price: 65000 },
            { name: 'Chả cá Thăng Long', quantity: 1, price: 85000 },
            { name: 'Trà đá', quantity: 2, price: 10000 }
          ]
        },
        {
          id: 'DH002',
          date: '2025-06-04T14:15:00Z',
          restaurantName: 'Pizza Hut',
          restaurantLogo: '🍕',
          totalAmount: 450000,
          status: 'delivering',
          statusText: 'Đang giao',
          items: [
            { name: 'Pizza Margherita size L', quantity: 1, price: 299000 },
            { name: 'Coca Cola', quantity: 2, price: 25000 },
            { name: 'Chicken Wings', quantity: 1, price: 89000 }
          ]
        },
        {
          id: 'DH003',
          date: '2025-06-03T19:45:00Z',
          restaurantName: 'KFC Vietnam',
          restaurantLogo: '🍗',
          totalAmount: 195000,
          status: 'preparing',
          statusText: 'Đang chuẩn bị',
          items: [
            { name: 'Gà rán phần', quantity: 1, price: 99000 },
            { name: 'Khoai tây chiên', quantity: 1, price: 35000 },
            { name: 'Pepsi', quantity: 1, price: 20000 }
          ]
        },
        {
          id: 'DH004',
          date: '2025-06-02T12:20:00Z',
          restaurantName: 'Highlands Coffee',
          restaurantLogo: '☕',
          totalAmount: 125000,
          status: 'cancelled',
          statusText: 'Đã hủy',
          items: [
            { name: 'Cà phê sữa đá', quantity: 2, price: 45000 },
            { name: 'Bánh mì', quantity: 1, price: 35000 }
          ]
        }
      ];
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'preparing', 'delivering'].includes(order.status);
    return order.status === filter;
  });

  if (!user) {
    return (
      <div className="order-history-container">
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f8fafc',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#ff7043', marginBottom: '1rem' }}>Vui lòng đăng nhập</h2>
            <p style={{ color: '#666' }}>Bạn cần đăng nhập để xem lịch sử đơn hàng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      {/* Header */}
      <header className="order-history-header">
        <div className="order-history-header-content">
          <button 
            onClick={onBackToHome || (() => window.history.back())}
            className="back-button"
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Lịch sử đơn hàng</h1>
        </div>
      </header>

      <div className="content-wrapper">
        {/* Filter Tabs */}
        <div className="card">
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'active', label: 'Đang xử lý' },
              { key: 'completed', label: 'Hoàn thành' },
              { key: 'cancelled', label: 'Đã hủy' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="card" style={{ color: '#ef5350', textAlign: 'center' }}>
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Không có đơn hàng nào
            </div>
            <div style={{ color: '#999', fontSize: '0.9rem' }}>
              {filter === 'all' ? 'Hãy đặt món đầu tiên của bạn!' : 'Không có đơn hàng trong danh mục này'}
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className={`order-card status-${order.status}`}
                onClick={() => onOrderClick && onOrderClick(order)}
              >
                <div className="order-card-header">
                  <div className="restaurant-info">
                    <div className="restaurant-logo">
                      {order.restaurantLogo}
                    </div>
                    <div>
                      <h3 className="restaurant-name">{order.restaurantName}</h3>
                      <p className="order-date">#{order.id} • {formatDate(order.date)}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`order-status status-${order.status}`}>
                      {order.statusText}
                    </div>
                    <div className="total-amount">
                      {order.totalAmount.toLocaleString()}₫
                    </div>
                  </div>
                </div>

                <div className="order-items">
                  <div className="order-item-summary">
                    {order.items.slice(0, 3).map((item, index) => (
                      <span key={index}>
                        {item.name} x{item.quantity}
                        {index < Math.min(2, order.items.length - 1) ? ', ' : ''}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span style={{ color: '#ff7043', fontWeight: '500' }}>
                        {' '}và {order.items.length - 3} món khác
                      </span>
                    )}
                  </div>
                </div>

                <div className="order-total">
                  <span>
                    {order.items.length} món • {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                  </span>
                  <span style={{ color: '#ff7043', fontWeight: '500' }}>
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;
