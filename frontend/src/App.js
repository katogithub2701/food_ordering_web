import React, { useState } from 'react';
import { CartProvider } from './contexts/CartContext';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentResultPage from './pages/PaymentResultPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import RestaurantPortal from './pages/RestaurantPortal';
import CartSidebar from './components/CartSidebar';
import Toast from './components/Toast';

function App() {  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved && token) {
      const userData = JSON.parse(saved);
      userData.token = token; // Ensure token is available
      return userData;
    }
    return null;
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
    localStorage.removeItem('token');
  };
  return (
    <CartProvider user={user}>
      {window.location.pathname.startsWith('/payment-result') ? (
        <PaymentResultPage />
      ) : user && user.role === 'restaurant' ? (
        <RestaurantPortal user={user} handleLogout={handleLogout} />
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
          <Toast />
        </>
      )}
    </CartProvider>
  );
}

export default App;
