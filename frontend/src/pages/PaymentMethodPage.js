import React, { useState } from 'react';

const PAYMENT_METHODS = [
  {
    id: 'VNPAY',
    name: 'VNPay',
    logo: 'https://sandbox.vnpayment.vn/apis/assets/images/logo_vnpay.png',
    desc: 'Thanh toán qua cổng VNPay (ATM, QR, Visa, ...)',
    color: '#0066CC',
    icon: '💳'
  },
  {
    id: 'COD',
    name: 'Thanh toán khi nhận hàng',
    logo: '',
    desc: 'Trả tiền mặt khi nhận hàng',
    color: '#28a745',
    icon: '💵'
  },
  // Có thể bổ sung MoMo, ZaloPay ...
];

const PaymentMethodPage = ({ orderId, onPaymentSuccess, onBack }) => {
  const [selected, setSelected] = useState(PAYMENT_METHODS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setError('');
    if (selected === 'COD') {
      // Xử lý COD (cập nhật trạng thái đơn hàng nếu cần)
      onPaymentSuccess && onPaymentSuccess({ method: 'COD', status: 'PAID' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 1 },
        body: JSON.stringify({ paymentMethod: selected, returnUrl: window.location.origin + '/payment-result' })
      });
      const data = await res.json();
      if (!res.ok || !data.paymentUrl) throw new Error(data.message || 'Không lấy được link thanh toán');
      // Hiển thị màn hình chờ rồi redirect
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ 
        maxWidth: '500px',
        width: '100%',
        background: '#fff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
          padding: '2rem',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💳</div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.8rem', 
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Chọn phương thức thanh toán
          </h2>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            opacity: 0.9,
            fontSize: '1rem'
          }}>
            Chọn cách thanh toán phù hợp với bạn
          </p>
        </div>

        {/* Payment Methods */}
        <div style={{ padding: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            {PAYMENT_METHODS.map(method => (
              <label 
                key={method.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: selected === method.id ? '2px solid #ff7043' : '2px solid #e0e0e0',
                  borderRadius: '16px', 
                  padding: '1.5rem', 
                  cursor: 'pointer', 
                  background: selected === method.id ? 'linear-gradient(135deg, #fff5f0 0%, #ffeaa7 100%)' : '#fff',
                  transition: 'all 0.3s ease',
                  transform: selected === method.id ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: selected === method.id ? '0 8px 24px rgba(255, 112, 67, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  if (selected !== method.id) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selected !== method.id) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }
                }}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value={method.id} 
                  checked={selected === method.id} 
                  onChange={() => setSelected(method.id)} 
                  style={{ 
                    display: 'none'
                  }} 
                />
                
                {/* Custom Radio Button */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: selected === method.id ? '2px solid #ff7043' : '2px solid #ddd',
                  marginRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selected === method.id ? '#ff7043' : '#fff',
                  transition: 'all 0.3s ease'
                }}>
                  {selected === method.id && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#fff'
                    }} />
                  )}
                </div>

                {/* Method Icon/Logo */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: method.color ? `${method.color}20` : '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  fontSize: '1.5rem'
                }}>
                  {method.logo ? (
                    <img 
                      src={method.logo} 
                      alt={method.name} 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'contain' 
                      }} 
                    />
                  ) : (
                    <span>{method.icon}</span>
                  )}
                </div>

                {/* Method Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '1.1rem',
                    color: '#333',
                    marginBottom: '0.25rem'
                  }}>
                    {method.name}
                  </div>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {method.desc}
                  </div>
                </div>

                {/* Selected Badge */}
                {selected === method.id && (
                  <div style={{
                    background: '#ff7043',
                    color: '#fff',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginLeft: '1rem'
                  }}>
                    ✓ Đã chọn
                  </div>
                )}
              </label>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              color: '#fff',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            flexDirection: 'column'
          }}>
            <button 
              onClick={handlePay} 
              disabled={loading} 
              style={{
                background: loading ? '#ccc' : 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                color: '#fff',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(255, 112, 67, 0.3)',
                transform: loading ? 'none' : 'translateY(0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(255, 112, 67, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(255, 112, 67, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.2rem' }}>
                    {selected === 'COD' ? '✅' : '💳'}
                  </span>
                  {selected === 'COD' ? 'Xác nhận đặt hàng' : `Thanh toán với ${PAYMENT_METHODS.find(m => m.id === selected)?.name}`}
                </>
              )}
            </button>

            <button 
              onClick={onBack} 
              style={{
                background: 'transparent',
                color: '#666',
                padding: '0.8rem 2rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#ff7043';
                e.target.style.color = '#ff7043';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.color = '#666';
              }}
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentMethodPage;
