import React, { useState } from 'react';

const PAYMENT_METHODS = [
  {
    id: 'VNPAY',
    name: 'VNPay',
    logo: 'https://sandbox.vnpayment.vn/apis/assets/images/logo_vnpay.png',
    desc: 'Thanh toán qua cổng VNPay (ATM, QR, Visa, ...)',
  },
  {
    id: 'COD',
    name: 'Thanh toán khi nhận hàng',
    logo: '',
    desc: 'Trả tiền mặt khi nhận hàng',
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
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
      <h2>Chọn phương thức thanh toán</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '24px 0' }}>
        {PAYMENT_METHODS.map(m => (
          <label key={m.id} style={{ display: 'flex', alignItems: 'center', border: selected === m.id ? '2px solid #ff7043' : '1px solid #ccc', borderRadius: 8, padding: 12, cursor: 'pointer', background: selected === m.id ? '#fff8f2' : '#fff' }}>
            <input type="radio" name="paymentMethod" value={m.id} checked={selected === m.id} onChange={() => setSelected(m.id)} style={{ marginRight: 16 }} />
            {m.logo && <img src={m.logo} alt={m.name} style={{ width: 48, height: 48, objectFit: 'contain', marginRight: 16 }} />}
            <div>
              <div style={{ fontWeight: 600, fontSize: 17 }}>{m.name}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{m.desc}</div>
            </div>
          </label>
        ))}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={{ padding: '10px 24px', borderRadius: 6 }}>Quay lại</button>
        <button onClick={handlePay} disabled={loading} style={{ background: '#ff7043', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>
          {loading ? 'Đang xử lý...' : selected === 'COD' ? 'Xác nhận đặt hàng' : `Thanh toán với ${PAYMENT_METHODS.find(m => m.id === selected)?.name}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodPage;
