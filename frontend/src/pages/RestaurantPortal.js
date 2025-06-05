import React, { useState, useEffect } from 'react';

function RestaurantPortal({ user, handleLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats
      const dashboardRes = await fetch('http://localhost:5000/api/restaurant-portal/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setDashboardStats(dashboardData);
      }

      // Fetch orders
      const ordersRes = await fetch('http://localhost:5000/api/restaurant-portal/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      // Fetch foods
      const foodsRes = await fetch('http://localhost:5000/api/restaurant-portal/foods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (foodsRes.ok) {
        const foodsData = await foodsRes.json();
        setFoods(foodsData);
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/restaurant-portal/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh orders
        fetchDashboardData();
        alert('Cập nhật trạng thái đơn hàng thành công!');
      } else {
        throw new Error('Không thể cập nhật trạng thái');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  useEffect(() => {
    if (user && user.role === 'restaurant') {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || user.role !== 'restaurant') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h2>Truy cập bị từ chối</h2>
          <p>Bạn cần đăng nhập với tài khoản nhà hàng để truy cập khu vực này.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏪</div>
          <div>Đang tải dữ liệu nhà hàng...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, color: '#ff7043', fontSize: '1.8rem' }}>
                🏪 {user.restaurant?.name || 'Cổng Nhà Hàng'}
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                Quản lý đơn hàng và thực đơn
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { key: 'dashboard', label: '📊 Tổng quan', icon: '📊' },
              { key: 'orders', label: '📦 Đơn hàng', icon: '📦' },
              { key: 'foods', label: '🍽️ Thực đơn', icon: '🍽️' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 0',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: activeTab === tab.key ? '#ff7043' : '#666',
                  borderBottom: activeTab === tab.key ? '3px solid #ff7043' : '3px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ color: '#333', marginBottom: '2rem' }}>📊 Tổng quan</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ color: '#ff7043', fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>
                  {dashboardStats.totalOrders || 0}
                </div>
                <div style={{ color: '#666' }}>Tổng đơn hàng</div>
              </div>

              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ color: '#22c55e', fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>
                  {dashboardStats.totalRevenue?.toLocaleString() || 0}₫
                </div>
                <div style={{ color: '#666' }}>Doanh thu</div>
              </div>

              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ color: '#3b82f6', fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>
                  {dashboardStats.totalFoods || 0}
                </div>
                <div style={{ color: '#666' }}>Món ăn</div>
              </div>

              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ color: '#f59e0b', fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>
                  {dashboardStats.pendingOrders || 0}
                </div>
                <div style={{ color: '#666' }}>Đơn chờ xử lý</div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ color: '#333', marginBottom: '2rem' }}>📦 Quản lý đơn hàng</h2>
            {orders.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                background: '#fff',
                borderRadius: '12px',
                color: '#666' 
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <div>Chưa có đơn hàng nào</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {orders.map(order => (
                  <div key={order.id} style={{
                    background: '#fff',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, color: '#333' }}>Đơn hàng #{order.id}</h3>
                        <p style={{ margin: '0.5rem 0', color: '#666' }}>
                          Khách hàng: {order.User?.username || 'N/A'}
                        </p>
                        <p style={{ margin: '0.5rem 0', color: '#666' }}>
                          Địa chỉ: {order.deliveryAddress}
                        </p>
                        <p style={{ margin: '0.5rem 0', color: '#666' }}>
                          SĐT: {order.contactPhone}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          background: getStatusColor(order.status),
                          color: '#fff',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          {getStatusText(order.status)}
                        </div>
                        <div style={{ color: '#ff7043', fontWeight: '700', fontSize: '1.2rem' }}>
                          {order.total.toLocaleString()}₫
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>Món ăn:</h4>
                      {order.OrderItems?.map(item => (
                        <div key={item.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '0.5rem 0',
                          borderBottom: '1px solid #f0f0f0'
                        }}>
                          <span>{item.Food?.name} x {item.quantity}</span>
                          <span>{(item.price * item.quantity).toLocaleString()}₫</span>
                        </div>
                      ))}
                    </div>

                    {/* Status Update Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {getAvailableStatuses(order.status).map(status => (
                        <button
                          key={status.value}
                          onClick={() => updateOrderStatus(order.id, status.value)}
                          style={{
                            background: status.color,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#333', margin: 0 }}>🍽️ Quản lý thực đơn</h2>
              <button
                onClick={() => setActiveTab('add-food')}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                + Thêm món mới
              </button>
            </div>

            {foods.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                background: '#fff',
                borderRadius: '12px',
                color: '#666' 
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                <div>Chưa có món ăn nào trong thực đơn</div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {foods.map(food => (
                  <div key={food.id} style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {food.imageUrl && (
                      <img 
                        src={food.imageUrl} 
                        alt={food.name}
                        style={{ 
                          width: '100%', 
                          height: '200px', 
                          objectFit: 'cover' 
                        }}
                      />
                    )}
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, color: '#333' }}>{food.name}</h3>
                        <span style={{
                          background: food.isAvailable ? '#22c55e' : '#ef4444',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {food.isAvailable ? 'Có sẵn' : 'Hết hàng'}
                        </span>
                      </div>
                      <p style={{ color: '#666', margin: '0.5rem 0 1rem 0', lineHeight: '1.5' }}>
                        {food.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: '#ff7043', fontWeight: '700', fontSize: '1.2rem' }}>
                          {food.price.toLocaleString()}₫
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            style={{
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getStatusColor(status) {
  const colors = {
    'pending': '#f59e0b',
    'confirmed': '#3b82f6',
    'preparing': '#8b5cf6',
    'ready_for_pickup': '#22c55e',
    'picked_up': '#06b6d4',
    'delivering': '#0ea5e9',
    'delivered': '#10b981',
    'completed': '#059669',
    'cancelled': '#ef4444'
  };
  return colors[status] || '#6b7280';
}

function getStatusText(status) {
  const texts = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'preparing': 'Đang chuẩn bị',
    'ready_for_pickup': 'Sẵn sàng lấy',
    'picked_up': 'Đã lấy',
    'delivering': 'Đang giao',
    'delivered': 'Đã giao',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };
  return texts[status] || status;
}

function getAvailableStatuses(currentStatus) {
  const statusFlow = {
    'pending': [
      { value: 'confirmed', label: 'Xác nhận', color: '#3b82f6' },
      { value: 'cancelled', label: 'Hủy đơn', color: '#ef4444' }
    ],
    'confirmed': [
      { value: 'preparing', label: 'Bắt đầu chuẩn bị', color: '#8b5cf6' },
      { value: 'cancelled', label: 'Hủy đơn', color: '#ef4444' }
    ],
    'preparing': [
      { value: 'ready_for_pickup', label: 'Sẵn sàng lấy', color: '#22c55e' }
    ],
    'ready_for_pickup': [
      { value: 'picked_up', label: 'Đã được lấy', color: '#06b6d4' }
    ],
    'picked_up': [
      { value: 'delivering', label: 'Đang giao hàng', color: '#0ea5e9' }
    ],
    'delivering': [
      { value: 'delivered', label: 'Đã giao hàng', color: '#10b981' },
      { value: 'delivery_failed', label: 'Giao hàng thất bại', color: '#ef4444' }
    ],
    'delivered': [
      { value: 'completed', label: 'Hoàn thành', color: '#059669' }
    ]
  };
  return statusFlow[currentStatus] || [];
}

export default RestaurantPortal;
