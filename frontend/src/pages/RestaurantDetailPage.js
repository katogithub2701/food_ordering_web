import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

function RestaurantDetailPage({ restaurantId, onBack, user }) {
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const { addItem } = useCart();

  // Function to add item to cart
  const handleAddToCart = async (foodId) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm món vào giỏ hàng.');
      return;
    }
    try {
      await addItem(foodId, 1);
      // Hiện thông báo toast khi thêm thành công
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Đã thêm món vào giỏ hàng!' } }));    } catch (err) {
      alert('Lỗi khi thêm vào giỏ hàng.');
    }
  };

  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        setLoading(true);
        // Fetch restaurant details
        const restaurantRes = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}`);
        if (!restaurantRes.ok) throw new Error('Không lấy được thông tin nhà hàng');
        const restaurantData = await restaurantRes.json();
        setRestaurant(restaurantData);

        // Fetch restaurant foods
        const foodsRes = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/foods`);
        if (!foodsRes.ok) throw new Error('Không lấy được danh sách món ăn');
        const foodsData = await foodsRes.json();
        setFoods(foodsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurantDetail();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
          <div>Đang tải thông tin nhà hàng...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff7043',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '2rem'
            }}
          >
            ← Quay lại
          </button>
          <div style={{ background: '#fee', color: '#c33', padding: '2rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff7043',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Restaurant Hero Section */}
      <div style={{
        background: restaurant.imageUrl ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${restaurant.imageUrl}) center/cover` : 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
        color: '#fff',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            display: 'inline-block'
          }}>
            <h1 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '3rem',
              fontWeight: '800',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {restaurant.name}
            </h1>
            <p style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '1.3rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {restaurant.description}
            </p>
            
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⭐</span>
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{restaurant.rating}/5</span>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🏷️</span>
                <span style={{ fontWeight: '600' }}>{restaurant.category}</span>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🕐</span>
                <span style={{ fontWeight: '600' }}>{restaurant.openTime} - {restaurant.closeTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ color: '#ff7043', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            📍 Thông tin liên hệ
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#333' }}>Địa chỉ:</strong>
                <div style={{ color: '#666', marginTop: '0.5rem' }}>{restaurant.address}</div>
              </div>
              
              {restaurant.phone && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#333' }}>Điện thoại:</strong>
                  <div style={{ color: '#666', marginTop: '0.5rem' }}>
                    <a href={`tel:${restaurant.phone}`} style={{ color: '#ff7043', textDecoration: 'none' }}>
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#333' }}>Giờ mở cửa:</strong>
                <div style={{ color: '#666', marginTop: '0.5rem' }}>
                  {restaurant.openTime} - {restaurant.closeTime} (Hàng ngày)
                </div>
              </div>
              
              <div>
                <strong style={{ color: '#333' }}>Loại hình:</strong>
                <div style={{ 
                  color: '#ff7043', 
                  marginTop: '0.5rem',
                  background: '#fff5f0',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  display: 'inline-block',
                  fontWeight: '600'
                }}>
                  {restaurant.category}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ color: '#ff7043', marginBottom: '2rem', fontSize: '1.8rem' }}>
            🍽️ Thực đơn
          </h2>
          
          {foods.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#666' 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
              <div>Thực đơn đang được cập nhật...</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {foods.map(food => (
                <div key={food.id} style={{
                  border: '2px solid #f0f0f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#ff7043';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.transform = 'translateY(0)';                }}
                onClick={() => setSelectedFood(food)}>
                  {food.imageUrl && (
                    <img 
                      src={food.imageUrl} 
                      alt={food.name}
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'cover' 
                      }}
                    />
                  )}
                  
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{
                        margin: 0,
                        color: '#333',
                        fontSize: '1.2rem',
                        fontWeight: '700'
                      }}>
                        {food.name}
                      </h3>
                      
                      <div style={{
                        background: '#ffeaa7',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        ⭐ {food.rating}
                      </div>
                    </div>
                    
                    <p style={{
                      color: '#666',
                      margin: '0.5rem 0 1rem 0',
                      lineHeight: '1.5'
                    }}>
                      {food.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        color: '#ff7043',
                        fontSize: '1.3rem',
                        fontWeight: '700'
                      }}>
                        {food.price.toLocaleString()}₫
                      </div>                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(food.id);
                        }}
                        style={{
                        background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.8rem 1.5rem',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}>
                        🛒 Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}        </div>
      </div>

      {/* Food Detail Modal */}
      {selectedFood && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
        onClick={() => setSelectedFood(null)}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setSelectedFood(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                zIndex: 1001
              }}
            >
              ×
            </button>

            {/* Food image */}
            {selectedFood.imageUrl && (
              <img 
                src={selectedFood.imageUrl} 
                alt={selectedFood.name}
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover',
                  borderRadius: '20px 20px 0 0'
                }}
              />
            )}

            {/* Food details */}
            <div style={{ padding: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <h2 style={{
                  margin: 0,
                  color: '#333',
                  fontSize: '2rem',
                  fontWeight: '700'
                }}>
                  {selectedFood.name}
                </h2>
                
                <div style={{
                  background: '#ffeaa7',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  ⭐ {selectedFood.rating}/5
                </div>
              </div>

              <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#ff7043', margin: '0 0 0.5rem 0' }}>Mô tả món ăn:</h3>
                <p style={{
                  color: '#666',
                  margin: 0,
                  lineHeight: '1.6',
                  fontSize: '16px'
                }}>
                  {selectedFood.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <div>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '0.5rem' }}>Giá:</div>
                  <div style={{
                    color: '#ff7043',
                    fontSize: '2rem',
                    fontWeight: '700'
                  }}>
                    {selectedFood.price.toLocaleString()}₫
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '0.5rem' }}>Nhà hàng:</div>
                  <div style={{
                    color: '#333',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    🏪 {restaurant.name}
                  </div>
                </div>
              </div>

              {user && (
                <button
                  onClick={() => {
                    handleAddToCart(selectedFood.id);
                    setSelectedFood(null);
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem 2rem',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  🛒 Thêm vào giỏ hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetailPage;
