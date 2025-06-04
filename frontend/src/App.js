import React, { useState } from 'react';
import { CartProvider } from './contexts/CartContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentResultPage from './pages/PaymentResultPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import CartSidebar from './components/CartSidebar';

function App() {
  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [cartForCheckout, setCartForCheckout] = useState(null);

  // Hàm đăng xuất
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <CartProvider user={user}>
      {window.location.pathname.startsWith('/payment-result') ? (
        <PaymentResultPage />
      ) : showPayment && lastOrderId ? (
        <PaymentMethodPage orderId={lastOrderId} onBack={() => { setShowPayment(false); setShowCheckout(true); }} onPaymentSuccess={() => { setShowPayment(false); setShowCheckout(false); setLastOrderId(null); }} />
      ) : showCheckout ? (
        <CheckoutPage cart={cartForCheckout} onOrderSuccess={orderId => { setShowCheckout(false); setShowPayment(true); setLastOrderId(orderId); }} />
      ) : (
        <>
          <HomePage
            user={user}
            setUser={setUser}
            showAuth={showAuth}
            setShowAuth={setShowAuth}
            authMode={authMode}
            setAuthMode={setAuthMode}
            setShowCart={setShowCart}
            handleLogout={handleLogout}
          />
          <CartSidebar
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            onCheckout={(cart) => {
              setCartForCheckout(cart);
              setShowCart(false);
              setShowCheckout(true);
            }}
          />
        </>
      )}
    </CartProvider>
  );
}

export default App;
