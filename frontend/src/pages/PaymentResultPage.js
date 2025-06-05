import React, { useEffect, useState } from 'react';

function getQueryParams() {
  const params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    params[key] = decodeURIComponent(value);
    return '';
  });
  return params;
}

const PaymentResultPage = () => {
  const [status, setStatus] = useState('processing'); // 'success' | 'fail' | 'processing'
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = getQueryParams();
    // VNPay trả về vnp_ResponseCode, vnp_TxnRef, vnp_Amount, ...
    setOrderId(params.vnp_TxnRef ? params.vnp_TxnRef.split('_')[0] : '');
    setAmount(params.vnp_Amount ? (parseInt(params.vnp_Amount) / 100).toLocaleString() + '₫' : '');
    if (params.vnp_ResponseCode === '00') {
      setStatus('success');
      setMessage('Thanh toán thành công!');
    } else if (params.vnp_ResponseCode) {
      setStatus('fail');
      setMessage('Thanh toán thất bại hoặc bị hủy.');
    } else {
      setStatus('processing');
      setMessage('Đang xác nhận kết quả thanh toán...');
    }
    // (Tùy chọn) Có thể gọi API backend để xác nhận trạng thái đơn hàng thực tế
  }, []);
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%',
        background: '#fff',
        borderRadius: '24px',
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #667eea20, #764ba220)',
          borderRadius: '50%',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #667eea15, #764ba215)',
          borderRadius: '50%',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {status === 'processing' && (
            <>
              <div style={{ 
                fontSize: '64px',
                marginBottom: '24px',
                animation: 'pulse 2s infinite'
              }}>
                ⏳
              </div>
              <h2 style={{ 
                fontSize: '24px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '16px'
              }}>
                {message}
              </h2>
              <div style={{ 
                color: '#666',
                fontSize: '16px',
                marginBottom: '32px'
              }}>
                Vui lòng chờ trong giây lát...
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #667eea20',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
            </>
          )}
          
          {status === 'success' && (
            <>
              <div style={{ 
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 25px rgba(82, 196, 26, 0.3)',
                animation: 'successBounce 0.6s ease-out'
              }}>
                <div style={{ 
                  fontSize: '36px',
                  color: '#fff'
                }}>
                  ✓
                </div>
              </div>
              
              <h2 style={{ 
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '24px'
              }}>
                Thanh toán thành công! 🎉
              </h2>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #52c41a10, #389e0d10)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid #52c41a20',
                marginBottom: '32px'
              }}>
                <div style={{ 
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Mã đơn hàng:</span>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: '#52c41a',
                    fontSize: '18px'
                  }}>
                    #{orderId}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '16px',
                  color: '#333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Số tiền:</span>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: '#52c41a',
                    fontSize: '20px'
                  }}>
                    {amount}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <a 
                  href="/order-history" 
                  style={{ 
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  📋 Xem đơn hàng
                </a>
                <a 
                  href="/" 
                  style={{ 
                    display: 'inline-block',
                    padding: '12px 24px',
                    border: '2px solid #667eea',
                    color: '#667eea',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  🏠 Về trang chủ
                </a>
              </div>
            </>
          )}
          
          {status === 'fail' && (
            <>
              <div style={{ 
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
                animation: 'shake 0.6s ease-out'
              }}>
                <div style={{ 
                  fontSize: '36px',
                  color: '#fff'
                }}>
                  ✗
                </div>
              </div>
              
              <h2 style={{ 
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '16px'
              }}>
                Thanh toán thất bại
              </h2>
              
              <div style={{ 
                color: '#666',
                fontSize: '16px',
                marginBottom: '32px',
                background: 'linear-gradient(135deg, #ff6b6b10, #ee5a5210)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #ff6b6b20'
              }}>
                {message}
              </div>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <a 
                  href="/checkout" 
                  style={{ 
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
                  }}
                >
                  🔄 Thử lại
                </a>
                <a 
                  href="/" 
                  style={{ 
                    display: 'inline-block',
                    padding: '12px 24px',
                    border: '2px solid #667eea',
                    color: '#667eea',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  🏠 Về trang chủ
                </a>
              </div>
            </>
          )}
        </div>

        {/* CSS Animations */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes successBounce {
              0% { transform: scale(0); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default PaymentResultPage;
