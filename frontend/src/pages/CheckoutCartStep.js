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
    <div>
      <h2>Xem lại giỏ hàng</h2>
      {cartItems.length === 0 ? (
        <div>Giỏ hàng trống.</div>
      ) : (
        <>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {cartItems.map((item, idx) => (
              <li key={item.itemId + '-' + idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <div>
                  Số lượng: <input type="number" min={1} value={item.quantity} onChange={e => handleQuantityChange(idx, e.target.value)} style={{ width: 48 }} />
                  <button onClick={() => handleRemove(idx)} style={{ marginLeft: 12, color: 'red' }}>Xóa</button>
                </div>
                <div>Đơn giá: {item.price.toLocaleString()}₫</div>
                <div>Thành tiền: {(item.price * item.quantity).toLocaleString()}₫</div>
              </li>
            ))}
          </ul>
          <div style={{ fontWeight: 600, marginTop: 16 }}>Tổng tạm tính: {total.toLocaleString()}₫</div>
          <button onClick={onNext} style={{ marginTop: 20, background: '#ff7043', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>Tiếp tục</button>
        </>
      )}
    </div>
  );
};

export default CheckoutCartStep;
