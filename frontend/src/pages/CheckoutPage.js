import React, { useState } from 'react';
import CheckoutCartStep from './CheckoutCartStep';
import CheckoutAddressStep from './CheckoutAddressStep';
import CheckoutConfirmStep from './CheckoutConfirmStep';
import { useCart } from '../contexts/CartContext';

const steps = [
  'Giỏ hàng',
  'Thông tin giao hàng',
  'Xác nhận'
];

const Stepper = ({ step }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: '2rem 0 3rem 0',
    padding: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    color: '#fff'
  }}>
    {steps.map((label, idx) => (
      <React.Fragment key={label}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            minWidth: 48,
            minHeight: 48,
            borderRadius: '50%',
            background: step >= idx ? 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)' : 'rgba(255,255,255,0.2)',
            color: step >= idx ? '#fff' : 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '1.2rem',
            border: step >= idx ? '3px solid #fff' : '3px solid rgba(255,255,255,0.3)',
            boxShadow: step === idx ? '0 4px 20px rgba(255, 112, 67, 0.4)' : 'none',
            transition: 'all 0.3s ease',
            transform: step === idx ? 'scale(1.1)' : 'scale(1)'
          }}>
            {step > idx ? '✓' : idx + 1}
          </div>
          <div style={{ 
            textAlign: 'center', 
            color: step >= idx ? '#fff' : 'rgba(255,255,255,0.7)', 
            fontWeight: step === idx ? '700' : '500', 
            fontSize: '0.9rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {label}
          </div>
        </div>
        {idx < steps.length - 1 && (
          <div style={{ 
            flex: 1, 
            height: '3px', 
            background: 'rgba(255,255,255,0.2)', 
            margin: '0 1rem', 
            minWidth: '60px', 
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: step > idx ? '100%' : '0%', 
              height: '100%', 
              background: 'linear-gradient(90deg, #ff7043 0%, #ff5722 100%)', 
              transition: 'width 0.5s ease',
              borderRadius: '2px'
            }} />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

// State tổng cho quy trình checkout
const CheckoutPage = ({ cart, onOrderSuccess }) => {
  const [step, setStep] = useState(0); // 0: Cart, 1: Address, 2: Confirm
  const [cartItems, setCartItems] = useState(cart?.items || []); // [{ itemId, quantity, price, note }]
  const [deliveryAddress, setDeliveryAddress] = useState(null); // { fullName, phone, street, ... }
  const [notes, setNotes] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [orderResult, setOrderResult] = useState(null);
  const { clearAllItems } = useCart();

  // Chuyển bước
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Khi đặt hàng thành công
  const handleOrderSuccess = async (orderResult) => {
    setOrderResult(orderResult);
    await clearAllItems();
    if (onOrderSuccess && orderResult?.orderId) {
      onOrderSuccess(orderResult.orderId);
    }
  };
  // Thêm nút quay về trang chủ và danh sách món ăn đã đặt
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Nút quay về trang chủ */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <a href="/" style={{
            display: 'inline-block',
            padding: '8px 20px',
            border: '2px solid #ff7043',
            color: '#ff7043',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 16,
            marginRight: 16,
            transition: 'all 0.2s',
          }}
            onMouseOver={e => { e.target.style.background = '#ff7043'; e.target.style.color = '#fff'; }}
            onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = '#ff7043'; }}
          >
            ← Về trang chủ
          </a>
        </div>
        <Stepper step={step} />
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          minHeight: '500px'
        }}>
          {step === 0 && (
            <>
              <CheckoutCartStep
                cartItems={cartItems}
                setCartItems={setCartItems}
                onNext={nextStep}              />
            </>
          )}
          {step === 1 && (
            <CheckoutAddressStep
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {step === 2 && (
            <CheckoutConfirmStep
              cartItems={cartItems}
              deliveryAddress={deliveryAddress}
              notes={notes}
              setNotes={setNotes}
              shippingFee={shippingFee}
              setShippingFee={setShippingFee}
              onBack={prevStep}
              setOrderResult={handleOrderSuccess}
              user={JSON.parse(localStorage.getItem('user') || '{}')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
