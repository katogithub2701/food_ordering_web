import React, { useState, useEffect } from 'react';
import '../styles/OrderTracking.css';

function OrderTracking({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch order data
  const fetchOrderData = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      const mockOrder = {
        id: 'DH002',
        date: '2025-06-04T14:15:00Z',
        restaurantName: 'Pizza Hut',
        restaurantLogo: '/api/placeholder/60/60',
        restaurantAddress: '123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
        restaurantPhone: '0901234567',
        totalAmount: 450000,
        deliveryFee: 25000,
        discount: 50000,
        finalAmount: 425000,
        status: 'delivering',
        statusText: 'Đang giao',
        estimatedDelivery: '2025-06-04T15:30:00Z',
        deliveryAddress: '456 Đường Lê Văn Việt, Quận 9, TP.HCM',
        recipientName: 'Nguyễn Văn A',
        recipientPhone: '0987654321',
        paymentMethod: 'Tiền mặt',
        items: [
          { 
            id: 1,
            name: 'Pizza Margherita size L', 
            quantity: 1, 
            price: 299000,
            image: '/api/placeholder/80/80',
            note: 'Không hành tây'
          },
          { 
            id: 2,
            name: 'Coca Cola', 
            quantity: 2, 
            price: 25000,
            image: '/api/placeholder/80/80'
          },
          { 
            id: 3,
            name: 'Chicken Wings', 
            quantity: 1, 
            price: 89000,
            image: '/api/placeholder/80/80',
            note: 'Cay vừa'
          }
        ],
        timeline: [
          {
            status: 'pending',
            label: 'Chờ xác nhận',
            time: '2025-06-04T14:15:00Z',
            completed: true,
            description: 'Đơn hàng đã được đặt thành công'
          },
          {
            status: 'confirmed',
            label: 'Đã xác nhận',
            time: '2025-06-04T14:18:00Z',
            completed: true,
            description: 'Nhà hàng đã xác nhận đơn hàng'
          },
          {
            status: 'preparing',
            label: 'Đang chuẩn bị',
            time: '2025-06-04T14:20:00Z',
            completed: true,
            description: 'Nhà hàng đang chuẩn bị món ăn'
          },
          {
            status: 'ready',
            label: 'Sẵn sàng giao',
            time: '2025-06-04T14:50:00Z',
            completed: true,
            description: 'Món ăn đã sẵn sàng, shipper đang đến nhận'
          },
          {
            status: 'delivering',
            label: 'Đang giao',
            time: '2025-06-04T15:00:00Z',
            completed: true,
            description: 'Shipper đang trên đường giao đến bạn',
            current: true
          },
          {
            status: 'completed',
            label: 'Hoàn thành',
            time: null,
            completed: false,
            description: 'Đơn hàng đã được giao thành công'
          }
        ],
        driver: {
          name: 'Trần Văn B',
          phone: '0912345678',
          rating: 4.8,
          vehicle: 'Honda Wave - 29B1-12345'
        }
      };
      setOrder(mockOrder);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchOrderData();
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

        {/* Timeline */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#333', fontSize: '1.3rem' }}>
            Tiến trình đơn hàng
          </h3>
          
          <div style={{ position: 'relative' }}>
            {order.timeline.map((step, index) => (
              <div key={step.status} style={{ 
                display: 'flex',
                marginBottom: index === order.timeline.length - 1 ? 0 : '2rem',
                position: 'relative'
              }}>
                {/* Timeline Line */}
                {index < order.timeline.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '15px',
                    top: '30px',
                    width: '2px',
                    height: '2rem',
                    background: step.completed ? '#66bb6a' : '#e0e0e0'
                  }} />
                )}
                
                {/* Timeline Dot */}
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: step.completed ? '#66bb6a' : step.current ? '#ff7043' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  flexShrink: 0,
                  border: step.current ? '3px solid #ffccbc' : 'none'
                }}>
                  {step.completed ? '✓' : step.current ? '●' : '○'}
                </div>
                
                {/* Timeline Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.25rem'
                  }}>
                    <h4 style={{ 
                      margin: 0, 
                      color: step.completed || step.current ? '#333' : '#999',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      {step.label}
                    </h4>
                    {step.time && (
                      <span style={{ 
                        color: '#666', 
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {formatTime(step.time)}
                      </span>
                    )}
                  </div>
                  <p style={{ 
                    margin: 0, 
                    color: step.completed || step.current ? '#666' : '#999',
                    fontSize: '0.9rem'
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurant Info */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1rem', color: '#333', fontSize: '1.3rem' }}>
            Thông tin nhà hàng
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              🍕
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{order.restaurantName}</h4>
              <p style={{ margin: '0 0 0.25rem', color: '#666', fontSize: '0.9rem' }}>
                📍 {order.restaurantAddress}
              </p>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                📞 {order.restaurantPhone}
              </p>
            </div>
          </div>
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
          
          {order.items.map(item => (
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
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🍽️
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{item.name}</h4>
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
                  {(item.price * item.quantity).toLocaleString()}₫
                </div>
                <div style={{ color: '#666', fontSize: '0.8rem' }}>
                  {item.price.toLocaleString()}₫ × {item.quantity}
                </div>
              </div>
            </div>
          ))}
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
            <p style={{ margin: '0 0 0.25rem', fontWeight: '600' }}>{order.recipientName}</p>
            <p style={{ margin: '0 0 0.25rem', color: '#666' }}>{order.deliveryAddress}</p>
            <p style={{ margin: 0, color: '#666' }}>📞 {order.recipientPhone}</p>
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
            <span>{order.totalAmount.toLocaleString()}₫</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Phí giao hàng</span>
            <span>{order.deliveryFee.toLocaleString()}₫</span>
          </div>
          
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#66bb6a' }}>Giảm giá</span>
              <span style={{ color: '#66bb6a' }}>-{order.discount.toLocaleString()}₫</span>
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
            <span>{order.finalAmount.toLocaleString()}₫</span>
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
