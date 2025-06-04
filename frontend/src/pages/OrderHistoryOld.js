import React, { useState, useEffect } from 'react';
import '../styles/OrderTracking.css';

function OrderHistory({ user, onOrderClick, onBackToHome }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockOrders = [
        {
          id: 'DH001',
          date: '2025-06-04T10:30:00Z',
          restaurantName: 'Nhà hàng Phố Huế',
          restaurantLogo: '/api/placeholder/40/40',
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
          restaurantLogo: '/api/placeholder/40/40',
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
          restaurantLogo: '/api/placeholder/40/40',
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
          restaurantLogo: '/api/placeholder/40/40',
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa726';
      case 'preparing': return '#42a5f5';
      case 'delivering': return '#ab47bc';
      case 'completed': return '#66bb6a';
      case 'cancelled': return '#ef5350';
      default: return '#666';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'pending': return '#fff3e0';
      case 'preparing': return '#e3f2fd';
      case 'delivering': return '#f3e5f5';
      case 'completed': return '#e8f5e8';
      case 'cancelled': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

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
    );
  }
  return (
    <div className="order-history-container">
      {/* Header */}
      <header className="order-history-header">
        <div className="order-history-header-content">          <button 
            onClick={onBackToHome || (() => window.history.back())}
            className="back-button"
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Lịch sử đơn hàng</h1>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>        {/* Filter Tabs */}
        <div className="card">
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'active', label: 'Đang xử lý' },
              { key: 'completed', label: 'Hoàn thành' },
              { key: 'cancelled', label: 'Đã hủy' }
            ].map(tab => (              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>        {/* Orders List */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredOrders.map(order => (
              <div
                key={order.id}
                onClick={() => onOrderClick && onOrderClick(order)}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#ff7043';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      🍽️
                    </div>
                    <div>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.1rem',
                        color: '#333',
                        fontWeight: '600'
                      }}>
                        {order.restaurantName}
                      </h3>
                      <p style={{ 
                        margin: '0.25rem 0 0', 
                        color: '#666',
                        fontSize: '0.9rem'
                      }}>
                        Mã: {order.id} • {formatDate(order.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: getStatusBgColor(order.status),
                      color: getStatusColor(order.status),
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'inline-block'
                    }}>
                      {order.statusText}
                    </div>
                    <div style={{ 
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      color: '#ff7043'
                    }}>
                      {order.totalAmount.toLocaleString()}₫
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div style={{ 
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    {order.items.slice(0, 3).map((item, index) => (
                      <span 
                        key={index}
                        style={{
                          background: '#f8fafc',
                          color: '#666',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span style={{
                        color: '#ff7043',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        +{order.items.length - 3} món khác
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    <span>{order.items.length} món • {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
                    <span style={{ color: '#ff7043', fontWeight: '500' }}>
                      Xem chi tiết →
                    </span>
                  </div>
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
