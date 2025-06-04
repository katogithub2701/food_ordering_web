import React from 'react';
import { useCart } from '../contexts/CartContext';

function CartIcon({ onClick, style = {} }) {
  const { itemCount } = useCart();

  return (
    <div 
      onClick={onClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        ...style
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>🛒</span>
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '600',
        color: 'inherit'
      }}>
        Giỏ hàng
      </span>
      
      {itemCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          background: '#ff4757',
          color: '#fff',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '700',
          animation: 'bounce 0.5s ease',
          boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)'
        }}>
          {itemCount > 99 ? '99+' : itemCount}
        </div>
      )}
      
      <style>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -8px, 0); }
          70% { transform: translate3d(0, -4px, 0); }
          90% { transform: translate3d(0, -2px, 0); }
        }
      `}</style>
    </div>
  );
}

export default CartIcon;
