import React from 'react';

const CheckoutCartStep = ({ cartItems, setCartItems, onNext }) => {
  // Tạm thời mock dữ liệu giỏ hàng nếu rỗng (demo)
  React.useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setCartItems([
        { itemId: 1, name: 'Pizza Margherita', quantity: 1, price: 299000 },
        { itemId: 2, name: 'Coca Cola', quantity: 2, price: 25000 }
      ]);
    }
    // eslint-disable-next-line
  }, []);

  const handleQuantityChange = (idx, value) => {
    const newItems = [...cartItems];
    newItems[idx].quantity = Math.max(1, parseInt(value) || 1);
    setCartItems(newItems);
  };
  const handleRemove = idx => {
    const newItems = cartItems.filter((_, i) => i !== idx);
    setCartItems(newItems);
  };
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛒</div>
        <h2 style={{ 
          margin: 0, 
          color: '#333',
          fontSize: '1.8rem',
          fontWeight: '700'
        }}>
          Xem lại giỏ hàng
        </h2>
        <p style={{ 
          color: '#666', 
          margin: '0.5rem 0 0 0',
          fontSize: '1rem'
        }}>
          Kiểm tra lại món ăn trước khi đặt hàng
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <div style={{ fontSize: '1.2rem' }}>Giỏ hàng trống</div>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div style={{
            marginBottom: '2rem'
          }}>
            {cartItems.map((item, idx) => (
              <div 
                key={item.itemId + '-' + idx} 
                style={{ 
                  background: '#f8f9fa',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0',
                      color: '#333',
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>
                      {item.name}
                    </h3>
                    <div style={{ 
                      color: '#ff7043',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      {item.price.toLocaleString()}₫ / món
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemove(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#dc3545';
                      e.target.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'none';
                      e.target.style.color = '#dc3545';
                    }}
                    title="Xóa khỏi giỏ hàng"
                  >
                    🗑️
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {/* Quantity Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    border: '1px solid #ddd'
                  }}>
                    <button
                      onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px'
                      }}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    
                    <input 
                      type="number" 
                      min={1} 
                      value={item.quantity} 
                      onChange={e => handleQuantityChange(idx, e.target.value)}
                      style={{ 
                        width: '60px',
                        textAlign: 'center',
                        border: 'none',
                        background: 'none',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}
                    />
                    
                    <button
                      onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px'
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={{
                    background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '1rem'
                  }}>
                    {(item.price * item.quantity).toLocaleString()}₫
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Tổng tạm tính
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {total.toLocaleString()}₫
            </div>
          </div>

          {/* Continue Button */}
          <button 
            onClick={onNext}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
              color: '#fff',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '700',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(255, 112, 67, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 30px rgba(255, 112, 67, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 20px rgba(255, 112, 67, 0.3)';
            }}
          >
            <span>Tiếp tục</span>
            <span style={{ fontSize: '1.3rem' }}>→</span>
          </button>
        </>
      )}
    </div>
  );
};

export default CheckoutCartStep;
