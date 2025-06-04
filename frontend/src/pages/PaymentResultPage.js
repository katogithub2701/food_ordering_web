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
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 32, textAlign: 'center' }}>
      {status === 'processing' && (
        <>
          <div style={{ fontSize: 32 }}>⏳</div>
          <h2>{message}</h2>
          <div>Vui lòng chờ trong giây lát...</div>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize: 48, color: '#4caf50' }}>✅</div>
          <h2>Thanh toán thành công!</h2>
          <div>Mã đơn hàng: <b>#{orderId}</b></div>
          <div>Số tiền: <b>{amount}</b></div>
          <div style={{ margin: '18px 0' }}>
            <a href="/" style={{ color: '#ff7043', fontWeight: 600 }}>Về trang chủ</a>
          </div>
        </>
      )}
      {status === 'fail' && (
        <>
          <div style={{ fontSize: 48, color: '#ef5350' }}>❌</div>
          <h2>Thanh toán thất bại</h2>
          <div>{message}</div>
          <div style={{ margin: '18px 0' }}>
            <a href="/checkout" style={{ color: '#ff7043', fontWeight: 600 }}>Thử lại</a>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentResultPage;
