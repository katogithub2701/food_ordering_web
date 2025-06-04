import React, { useState } from 'react';

const DEFAULT_SHIPPING_FEE = 40000;

const CheckoutConfirmStep = ({ cartItems, deliveryAddress, notes, setNotes, onBack, setOrderResult }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingFee] = useState(DEFAULT_SHIPPING_FEE);

  const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = itemsTotal + shippingFee;

  const handleOrder = async () => {
    setLoading(true);
    setError('');
    try {
      // Gửi request tạo đơn hàng
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 1 // TODO: Lấy userId thực tế nếu có auth
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
    <div>
      <h2>Tóm tắt & Xác nhận đơn hàng</h2>
      <div style={{ marginBottom: 16 }}>
        <h4>Sản phẩm</h4>
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {cartItems.map((item, idx) => (
            <li key={item.itemId ? `item-${item.itemId}` : `idx-${idx}`}>
              {item.name} x{item.quantity} - {(item.price * item.quantity).toLocaleString()}₫
            </li>
          ))}
        </ul>
        <h4>Địa chỉ giao hàng</h4>
        <div>{deliveryAddress.fullName} - {deliveryAddress.phone}</div>
        <div>{deliveryAddress.street}, {deliveryAddress.ward}, {deliveryAddress.district}, {deliveryAddress.city}</div>
        <h4>Ghi chú</h4>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', minHeight: 40 }} placeholder="Ghi chú cho đơn hàng (nếu có)" />
        <h4>Phí giao hàng</h4>
        <div style={{ fontWeight: 600, color: '#ff7043', fontSize: 16 }}>40.000₫</div>
        <div style={{ marginTop: 12, fontWeight: 600 }}>Tổng cộng: {totalAmount.toLocaleString()}₫</div>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={{ padding: '10px 24px', borderRadius: 6 }}>Quay lại</button>
        <button onClick={handleOrder} disabled={loading} style={{ background: '#ff7043', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>
          {loading ? 'Đang đặt hàng...' : 'Xác nhận Đặt hàng'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutConfirmStep;
