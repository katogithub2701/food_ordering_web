import React, { useState, useEffect } from 'react';
import '../styles/OrderTracking.css';
import { 
  getStatusLabel, 
  isActiveStatus,
  isCompletedStatus,
  isCancelledStatus 
} from '../utils/orderStatus';
import { fetchOrders } from '../services/orderService';

const FILTER_STATUS_MAP = {
  all: null,
  pending: ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up'],
  delivering: ['delivering'],
  completed: ['delivered', 'completed'],
  cancelled: ['cancelled', 'delivery_failed', 'returning', 'returned', 'refunded']
};

function OrderHistory({ user, onOrderClick, onBackToHome }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user || !user.token) {
      setLoading(false);
      setError('Bạn cần đăng nhập lại để xem đơn hàng.');
      return;
    }
    setLoading(true);
    setError('');

    const fetchAllStatuses = async () => {
      const statusList = FILTER_STATUS_MAP[filter];
      if (!statusList) {
        // 'all' tab: fetch all
        const res = await fetchOrders({ token: user.token, page });
        return res;
      }
      // If only one status, fetch once
      if (statusList.length === 1) {
        return await fetchOrders({ token: user.token, page, status: statusList[0] });
      }
      // If multiple statuses, fetch all and merge
      const results = await Promise.all(
        statusList.map(status => fetchOrders({ token: user.token, page, status }))
      );
      // Merge orders, remove duplicates by id
      let allOrders = [];
      let totalItems = 0;
      let totalPages = 1;
      results.forEach(res => {
        if (res.success) {
          allOrders = allOrders.concat(res.data.orders);
          totalItems += res.data.pagination.totalItems;
          totalPages = Math.max(totalPages, res.data.pagination.totalPages);
        }
      });
      // Remove duplicate orders by id
      const uniqueOrders = Object.values(
        allOrders.reduce((acc, order) => {
          acc[order.id] = order;
          return acc;
        }, {})
      );
      return {
        success: true,
        data: {
          orders: uniqueOrders,
          pagination: {
            totalPages,
            totalItems
          }
        }
      };
    };

    fetchAllStatuses()
      .then(res => {
        if (res.success) {
          setOrders(res.data.orders);
          setTotalPages(res.data.pagination.totalPages);
        } else {
          setError(res.message || 'Lỗi khi tải đơn hàng');
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Lỗi khi tải đơn hàng');
        setLoading(false);
      });
  }, [user, filter, page]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };  const filteredOrders = orders; // Đã lọc từ API

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
              { key: 'pending', label: 'Chờ xác nhận' },
              { key: 'delivering', label: 'Đang giao' },
              { key: 'completed', label: 'Hoàn thành' },
              { key: 'cancelled', label: 'Đã hủy' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setPage(1); }}
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
          <div className="no-orders" style={{ color: '#ef5350' }}>{error}</div>
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
          <>
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
                        {order.restaurantLogo || '🍽️'}
                      </div>
                      <div>
                        <h3 className="restaurant-name">{order.restaurantName || ''}</h3>
                        <p className="order-date">#{order.id} • {formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={`order-status status-${order.status}`}>
                        {getStatusLabel(order.status)}
                      </div>
                      <div className="total-amount">
                        {order.total.toLocaleString()}₫
                      </div>
                    </div>
                  </div>
                  <div className="order-items">
                    <div className="order-item-summary">
                      {order.items.slice(0, 3).map((item, index) => (
                        <span key={index}>
                          {item.foodName} x{item.quantity}
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
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>←</button>
                <span>Trang {page}/{totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;