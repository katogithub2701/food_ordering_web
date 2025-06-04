import React, { useState, useEffect } from 'react';

function RestaurantDetailPage({ restaurantId, onBack }) {
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
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
                      </div>
                      
                      <button style={{
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
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetailPage;
