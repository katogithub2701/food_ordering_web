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
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0 32px 0' }}>
    {steps.map((label, idx) => (
      <React.Fragment key={label}>
        <div style={{
          minWidth: 36,
          minHeight: 36,
          borderRadius: '50%',
          background: step === idx ? '#ff7043' : '#eee',
          color: step === idx ? '#fff' : '#888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 18,
          border: step === idx ? '2px solid #ff7043' : '2px solid #eee',
          boxShadow: step === idx ? '0 2px 8px #ff704344' : 'none',
          transition: 'all 0.2s',
        }}>{idx + 1}</div>
        <div style={{ minWidth: 90, textAlign: 'center', color: step === idx ? '#ff7043' : '#888', fontWeight: step === idx ? 600 : 400, fontSize: 14, marginTop: 4 }}>{label}</div>
        {idx < steps.length - 1 && (
          <div style={{ flex: 1, height: 2, background: '#eee', margin: '0 8px', minWidth: 32, maxWidth: 60 }}>
            <div style={{ width: step > idx ? '100%' : '0%', height: '100%', background: '#ff7043', transition: 'width 0.2s' }} />
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

  // Render từng bước
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <Stepper step={step} />
      {step === 0 && (
        <CheckoutCartStep
          cartItems={cartItems}
          setCartItems={setCartItems}
          onNext={nextStep}
        />
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
        />
      )}
      {/* Không hiển thị thông báo thành công ở đây nữa, chuyển sang PaymentMethodPage */}
    </div>
  );
};

export default CheckoutPage;
