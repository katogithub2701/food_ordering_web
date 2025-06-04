import React, { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

function CartSidebar({ isOpen, onClose, onCheckout }) {
  const { 
    items, 
    total, 
    loading, 
    error, 
    notifications,
    updateItem, 
    removeItem, 
    clearAllItems,
    removeNotification,
    clearError 
  } = useCart();

  // Auto-remove notifications
  useEffect(() => {
    notifications.forEach(notification => {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 3000);
    });
  }, [notifications, removeNotification]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        background: '#fff',
        zIndex: 1001,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <h2 style={{
            margin: 0,
            color: '#ff7043',
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            🛒 Giỏ hàng ({items.length})
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#666'
            }}>
              Đang tải giỏ hàng...
            </div>
          )}

          {error && (
            <div style={{
              margin: '1rem',
              padding: '1rem',
              background: '#fee',
              color: '#c33',
              borderRadius: '8px',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {error}
              <button
                onClick={clearError}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c33',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          )}

          {!loading && items.length === 0 ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#888'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <h3 style={{ color: '#666', margin: '0 0 0.5rem 0' }}>
                Giỏ hàng trống
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Hãy thêm món ăn yêu thích vào giỏ hàng!
              </p>
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>
              {items.map(item => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onUpdateQuantity={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e0e0e0',
            background: '#f8fafc'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              fontSize: '1.1rem',
              fontWeight: '700'
            }}>
              <span>Tổng cộng:</span>
              <span style={{ color: '#ff7043' }}>
                {total.toLocaleString()}₫
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={clearAllItems}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: '#fff',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Xóa tất cả
              </button>
              <button
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  if (onClose) onClose();
                  if (onCheckout) onCheckout({ items, total });
                }}
              >
                Đặt hàng ngay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#4CAF50',
            color: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            zIndex: 1002,
            animation: 'slideInRight 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {notification.message}
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      border: '1px solid #f0f0f0',
      borderRadius: '12px',
      marginBottom: '1rem',
      background: '#fff'
    }}>
      {/* Image */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        background: item.food.imageUrl 
          ? `url(${item.food.imageUrl}) center/cover` 
          : 'linear-gradient(135deg, #ff7043, #ff5722)',
        flexShrink: 0
      }} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          margin: '0 0 0.25rem 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#333',
          lineHeight: '1.3'
        }}>
          {item.food.name}
        </h4>
        
        {item.food.restaurantName && (
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '12px',
            color: '#888'
          }}>
            {item.food.restaurantName}
          </p>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Quantity Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              style={{
                width: '28px',
                height: '28px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#666'
              }}
            >
              −
            </button>
            
            <span style={{
              minWidth: '30px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {item.quantity}
            </span>
            
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              style={{
                width: '28px',
                height: '28px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#666'
              }}
            >
              +
            </button>
          </div>

          {/* Price */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#ff7043'
            }}>
              {item.subtotal.toLocaleString()}₫
            </div>
            <div style={{
              fontSize: '12px',
              color: '#888'
            }}>
              {item.price.toLocaleString()}₫/món
            </div>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#999',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '4px',
          alignSelf: 'flex-start'
        }}
      >
        🗑️
      </button>
    </div>
  );
}

export default CartSidebar;
