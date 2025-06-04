import React, { useState } from 'react';
import OrderHistory from './OrderHistory';
import OrderTracking from './OrderTracking';

function OrderManager({ user, onBackToHome }) {
  const [currentView, setCurrentView] = useState('history'); // 'history' or 'tracking'
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleOrderClick = (order) => {
    setSelectedOrderId(order.id);
    setCurrentView('tracking');
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
    setSelectedOrderId(null);
  };

  if (currentView === 'tracking' && selectedOrderId) {
    return (
      <OrderTracking 
        orderId={selectedOrderId}
        onBack={handleBackToHistory}
        user={user}
      />
    );
  }

  return (
    <OrderHistory 
      user={user}
      onOrderClick={handleOrderClick}
      onBackToHome={onBackToHome}
    />
  );
}

export default OrderManager;
