import React, { useState } from 'react';

const DEFAULT_SHIPPING_FEE = 40000;

const CheckoutConfirmStep = ({ cartItems, deliveryAddress, notes, setNotes, onBack, setOrderResult, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingFee] = useState(DEFAULT_SHIPPING_FEE);

  const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = itemsTotal + shippingFee;

  const handleOrder = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user token (from props or localStorage fallback)
      const token = user?.token || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').token : undefined);
      if (!token) throw new Error('Bạn cần đăng nhập để đặt hàng');
      // Gửi request tạo đơn hàng
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems: cartItems.map(i => ({
            foodId: i.foodId || i.id || i.itemId, // Ưu tiên foodId, fallback sang id hoặc itemId
            quantity: i.quantity,
            note: i.note
          })),
          deliveryAddress: {
            ...deliveryAddress,
            city: deliveryAddress.province // Đảm bảo backend nhận đúng trường city
          },
          notes,
          shippingFee,
          totalAmount
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đặt hàng thất bại');
      setOrderResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: '32px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        ✅ Xác nhận đơn hàng
      </div>

      <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
        {/* Order Items Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea10, #764ba210)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #667eea20'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🛒 Sản phẩm đã chọn
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cartItems.map((item, idx) => {
              const foodName = item.name || (item.food && item.food.name) || '';
              return (
                <div 
                  key={item.itemId ? `item-${item.itemId}` : `idx-${idx}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                      {foodName}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      Số lượng: {item.quantity}
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: '600',
                    color: '#667eea',
                    fontSize: '16px'
                  }}>
                    {(item.price * item.quantity).toLocaleString()}₫
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #52c41a10, #95de6410)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #52c41a20'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📍 Địa chỉ giao hàng
          </h3>
          <div style={{ 
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: '#333', 
              fontSize: '16px',
              marginBottom: '8px'
            }}>
              {deliveryAddress.fullName} • {deliveryAddress.phone}
            </div>
            <div style={{ 
              color: '#666', 
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {deliveryAddress.street}, {deliveryAddress.ward && `${deliveryAddress.ward}, `}
              {deliveryAddress.district}, {deliveryAddress.city || deliveryAddress.province}
            </div>
          </div>
        </div>

        {/* Order Notes Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #ffa50010, #ff851410)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #ffa50020'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📝 Ghi chú đơn hàng
          </h3>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Ghi chú cho đơn hàng (nếu có)..."
            style={{ 
              width: '100%', 
              minHeight: '80px',
              padding: '16px',
              border: '2px solid #e1e5e9',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e1e5e9';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Order Summary Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea15, #764ba215)',
          padding: '24px',
          borderRadius: '16px',
          border: '2px solid #667eea30'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💰 Tóm tắt thanh toán
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #667eea20'
            }}>
              <span style={{ color: '#666', fontSize: '16px' }}>Tổng tiền món ăn:</span>
              <span style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
                {itemsTotal.toLocaleString()}₫
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #667eea20'
            }}>
              <span style={{ color: '#666', fontSize: '16px' }}>Phí giao hàng:</span>
              <span style={{ 
                fontWeight: '600', 
                fontSize: '16px', 
                color: '#52c41a'
              }}>
                {shippingFee.toLocaleString()}₫
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Tổng cộng:</span>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 'bold'
              }}>
                {totalAmount.toLocaleString()}₫
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          background: 'linear-gradient(135deg, #ff6b6b20, #ee5a5220)',
          color: '#d63031',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #ff6b6b40',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button 
          onClick={onBack} 
          style={{ 
            padding: '12px 32px', 
            borderRadius: '8px',
            border: '2px solid #e1e5e9',
            background: 'white',
            color: '#666',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.color = '#667eea';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e1e5e9';
            e.target.style.color = '#666';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Quay lại
        </button>
        <button 
          onClick={handleOrder} 
          disabled={loading} 
          style={{ 
            background: loading 
              ? 'linear-gradient(135deg, #ccc, #aaa)' 
              : 'linear-gradient(135deg, #52c41a, #389e0d)', 
            color: '#fff', 
            padding: '12px 32px', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '600', 
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: loading 
              ? 'none' 
              : '0 4px 15px rgba(82, 196, 26, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(82, 196, 26, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(82, 196, 26, 0.4)';
            }
          }}
        >
          {loading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {loading ? 'Đang xử lý...' : '🎉 Xác nhận Đặt hàng'}
        </button>
      </div>

      {/* Loading Animation Keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CheckoutConfirmStep;
