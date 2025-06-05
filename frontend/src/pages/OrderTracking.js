import React, { useState, useEffect } from 'react';
import '../styles/OrderTracking.css';
import { fetchOrderDetail } from '../services/orderService';

function OrderTracking({ orderId, onBack, user }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch order data
  const fetchOrderData = () => {
    setRefreshing(true);
    setError('');
    fetchOrderDetail(orderId, user.token)
      .then(res => {        if (res.success) {
          // Chuyển đổi dữ liệu API sang format UI
          const o = res.data;
          
          // Calculate totals if not provided by backend
          const itemsTotal = o.items ? o.items.reduce((sum, item) => {
            return sum + ((item.price || 0) * (item.quantity || 0));
          }, 0) : 0;
          
          const deliveryFee = o.deliveryFee || o.shippingFee || 0;
          const discount = o.discount || 0;
          const finalAmount = o.finalAmount || o.total || (itemsTotal + deliveryFee - discount);
          
          setOrder({
            ...o,
            // Ensure all required fields are present
            totalAmount: o.totalAmount || itemsTotal,
            deliveryFee: deliveryFee,
            discount: discount,
            finalAmount: finalAmount,
            date: o.date || o.createdAt,
            statusText: o.status && (window.getStatusLabel ? window.getStatusLabel(o.status) : o.status),
            timeline: o.statusHistory?.map(h => ({
              status: h.toStatus,
              label: window.getStatusLabel ? window.getStatusLabel(h.toStatus) : h.toStatus,
              time: h.changedAt,
              completed: true,
              description: h.note || '',
              current: false
            })) || []
          });
        } else {
          setError(res.message || 'Lỗi khi tải chi tiết đơn hàng');
        }
        setLoading(false);
        setRefreshing(false);
      })
      .catch(e => {
        setError(e.message || 'Lỗi khi tải chi tiết đơn hàng');
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchOrderData();
    // eslint-disable-next-line
  }, [orderId]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstimatedDeliveryTime = (estimatedTime) => {
    if (!estimatedTime) return '';
    const now = new Date();
    const estimated = new Date(estimatedTime);
    const diffMinutes = Math.max(0, Math.ceil((estimated - now) / (1000 * 60)));
    
    if (diffMinutes <= 0) return 'Sắp đến';
    if (diffMinutes < 60) return `Còn khoảng ${diffMinutes} phút`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `Còn khoảng ${hours}h${minutes > 0 ? ` ${minutes}p` : ''}`;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#666', fontSize: '1.1rem' }}>Đang tải thông tin đơn hàng...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#ef5350' }}>
          {error || 'Không tìm thấy đơn hàng'}
        </div>
      </div>
    );
  }

  // Parse delivery address string if needed
  let recipientName = order.recipientName;
  let recipientPhone = order.recipientPhone;
  let deliveryAddress = order.deliveryAddress;
  if (!recipientName || !recipientPhone) {
    // Try to parse from deliveryAddress string: "fullName, phone, street, ward, district, city"
    if (order.deliveryAddress) {
      const parts = order.deliveryAddress.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        recipientName = parts[0];
        recipientPhone = parts[1];
        deliveryAddress = parts.slice(2).join(', ');
      }
    }
    if (order.contactPhone && !recipientPhone) recipientPhone = order.contactPhone;
  }

  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      minHeight: '100vh', 
      background: '#f8fafc',
      paddingBottom: '2rem'
    }}>
      {/* Header */}
      <header style={{ 
        background: '#ff7043', 
        color: '#fff', 
        padding: '1.5rem 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button 
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Chi tiết đơn hàng</h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1rem', opacity: '0.9' }}>
              Mã đơn: {order.id}
            </p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Delivery Status Card */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '2px solid #ff7043'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {order.status === 'delivering' ? '🚚' : 
               order.status === 'completed' ? '✅' : 
               order.status === 'preparing' ? '👨‍🍳' : '📝'}
            </div>
            <h2 style={{ 
              margin: 0, 
              color: '#ff7043', 
              fontSize: '1.5rem',
              marginBottom: '0.5rem'
            }}>
              {order.statusText}
            </h2>
            {order.status === 'delivering' && (
              <div style={{
                background: '#e8f5e8',
                color: '#2e7d32',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                {getEstimatedDeliveryTime(order.estimatedDelivery)}
              </div>
            )}
          </div>

          {/* Driver Info (if delivering) */}
          {order.status === 'delivering' && order.driver && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.75rem', color: '#333' }}>Thông tin tài xế</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{order.driver.name}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>{order.driver.vehicle}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>⭐ {order.driver.rating}/5</div>
                </div>
                <a 
                  href={`tel:${order.driver.phone}`}
                  style={{
                    background: '#ff7043',
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  📞 Gọi tài xế
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#333', fontSize: '1.3rem' }}>
            Chi tiết đơn hàng
          </h3>
          
          {order.items.map(item => {
            // Ưu tiên hiển thị tên món ăn từ các trường phổ biến
            const foodName = item.foodName || (item.food && item.food.name) || item.name || 'Món ăn';
            return (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  background: item.imageUrl ? `url(${item.imageUrl}) center/cover` : '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  overflow: 'hidden'
                }}>
                  {!item.imageUrl && '🍽️'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{foodName}</h4>
                  {item.options && item.options.length > 0 && (
                    <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Tuỳ chọn: {item.options.map(opt => opt.label || opt.name).join(', ')}
                    </div>
                  )}
                  <p style={{ margin: '0 0 0.25rem', color: '#666', fontSize: '0.9rem' }}>
                    Số lượng: {item.quantity}
                  </p>
                  {item.note && (
                    <p style={{ margin: 0, color: '#ff7043', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      Ghi chú: {item.note}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#ff7043' }}>
                    {(item.price != null && item.quantity != null) ? (item.price * item.quantity).toLocaleString() : '0'}₫
                  </div>
                  <div style={{ color: '#666', fontSize: '0.8rem' }}>
                    {item.price != null ? item.price.toLocaleString() : '0'}₫ × {item.quantity}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery Info */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1rem', color: '#333', fontSize: '1.3rem' }}>
            Thông tin giao hàng
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#333' }}>Địa chỉ giao hàng</h4>
            <p style={{ margin: '0 0 0.25rem', fontWeight: '600' }}>{recipientName}</p>
            <p style={{ margin: '0 0 0.25rem', color: '#666' }}>{deliveryAddress}</p>
            <p style={{ margin: 0, color: '#666' }}>📞 {recipientPhone}</p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem', color: '#333' }}>Phương thức thanh toán</h4>
            <p style={{ margin: 0, color: '#666' }}>{order.paymentMethod}</p>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1rem', color: '#333', fontSize: '1.3rem' }}>
            Tổng kết đơn hàng
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Tạm tính</span>
            <span>{order.totalAmount != null ? order.totalAmount.toLocaleString() : '0'}₫</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Phí giao hàng</span>
            <span>{order.deliveryFee != null ? order.deliveryFee.toLocaleString() : '0'}₫</span>
          </div>
          
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#66bb6a' }}>Giảm giá</span>
              <span style={{ color: '#66bb6a' }}>-{order.discount != null ? order.discount.toLocaleString() : '0'}₫</span>
            </div>
          )}
          
          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '1rem 0' }} />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#ff7043'
          }}>
            <span>Tổng cộng</span>
            <span>{order.finalAmount != null ? order.finalAmount.toLocaleString() : '0'}₫</span>
          </div>
          
          <div style={{ 
            textAlign: 'center',
            marginTop: '1rem',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Đặt lúc: {formatDate(order.date)} {formatTime(order.date)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;
