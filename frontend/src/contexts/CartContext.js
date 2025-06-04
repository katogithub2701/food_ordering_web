import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/cartService';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        loading: false
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, { 
          id: Date.now(), 
          message: action.payload, 
          type: 'success' 
        }] 
      };
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  notifications: []
};

export function CartProvider({ children, user }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Tải giỏ hàng khi user thay đổi
  useEffect(() => {
    if (user?.username) {
      loadCart();
    } else {
      dispatch({ type: 'SET_CART', payload: { items: [], total: 0 } });
    }
  }, [user?.username]);

  const loadCart = async () => {
    if (!user?.username) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('Loading cart for user:', user.username);
      const cart = await fetchCart(user.username);
      console.log('Cart loaded:', cart);
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Load cart error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addItem = async (foodId, quantity = 1) => {
    if (!user?.username) {
      dispatch({ type: 'SET_ERROR', payload: 'Vui lòng đăng nhập để thêm vào giỏ hàng' });
      return;
    }

    try {
      console.log('Adding to cart:', { username: user.username, foodId, quantity });
      await addToCart(user.username, foodId, quantity);
      await loadCart();
      dispatch({ type: 'ADD_NOTIFICATION', payload: 'Đã thêm vào giỏ hàng!' });
    } catch (error) {
      console.error('Add item error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateItem = async (cartItemId, quantity) => {
    if (!user?.username) return;

    try {
      await updateCartItem(user.username, cartItemId, quantity);
      await loadCart();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const removeItem = async (cartItemId) => {
    if (!user?.username) return;

    try {
      await removeFromCart(user.username, cartItemId);
      await loadCart();
      dispatch({ type: 'ADD_NOTIFICATION', payload: 'Đã xóa khỏi giỏ hàng!' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const clearAllItems = async () => {
    if (!user?.username) return;

    try {
      await clearCart(user.username);
      await loadCart();
      dispatch({ type: 'ADD_NOTIFICATION', payload: 'Đã xóa toàn bộ giỏ hàng!' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    addItem,
    updateItem,
    removeItem,
    clearAllItems,
    removeNotification,
    clearError,
    itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
