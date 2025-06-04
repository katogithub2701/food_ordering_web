import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import SearchPage from './SearchPage';
import RestaurantDetailPage from './RestaurantDetailPage';
import CartIcon from '../components/CartIcon';
import CartSidebar from '../components/CartSidebar';
import { CartProvider, useCart } from '../contexts/CartContext';
import { fetchFoods } from '../services/foodService';
import { fetchRestaurants } from '../services/restaurantService';

function HomePageContent({ user, setUser, showAuth, setShowAuth, authMode, setAuthMode }) {
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [errorFoods, setErrorFoods] = useState('');
  const [errorRestaurants, setErrorRestaurants] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetchFoods()
      .then(setFoods)
      .catch(() => setErrorFoods('Không lấy được danh sách món ăn'))
      .finally(() => setLoadingFoods(false));
      
    fetchRestaurants()
      .then(setRestaurants)
      .catch(() => setErrorRestaurants('Không lấy được danh sách nhà hàng'))
      .finally(() => setLoadingRestaurants(false));
  }, []);

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(search.toLowerCase()) ||
    food.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = async (foodId) => {
    if (!user) {
      setShowAuth(true);
      setAuthMode('login');
      return;
    }
    
    try {
      // Nếu addItem cần username, truyền user.username
      await addItem(foodId, 1, user.username);
      // Nếu addItem chỉ cần foodId, quantity thì giữ nguyên
      // await addItem(foodId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (showAuth) {
    return <AuthPage initialMode={authMode} onClose={() => setShowAuth(false)} setUser={setUser} />;
  }

  if (showSearch) {
    return <SearchPage onBack={() => setShowSearch(false)} />;
  }

  if (selectedRestaurantId) {
    return <RestaurantDetailPage 
      restaurantId={selectedRestaurantId} 
      onBack={() => setSelectedRestaurantId(null)} 
    />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#ff7043', color: '#fff', padding: '2rem 0 1.5rem 0', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Food Delivery App</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem' }}>Đặt món ăn yêu thích, giao tận nơi nhanh chóng!</p>
        <div style={{ position: 'absolute', top: 24, right: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
          {!user ? (
            <>
              <button onClick={() => { setShowAuth(true); setAuthMode('login'); }} style={{ background: '#fff', color: '#ff7043', border: 'none', borderRadius: 4, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 15, marginRight: 4, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}>Đăng nhập</button>
              <button onClick={() => { setShowAuth(true); setAuthMode('register'); }} style={{ background: '#fff', color: '#ff7043', border: 'none', borderRadius: 4, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}>Đăng ký</button>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 600, fontSize: 16 }}>Xin chào, {user.username}!</span>
              <CartIcon 
                onClick={() => setShowCartSidebar(true)}
                style={{ color: '#fff' }}
              />
              <button onClick={() => {}} style={{ background: '#fff', color: '#ff7043', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Đơn hàng của tôi</button>
              <button onClick={() => setUser(null)} style={{ background: '#fff', color: '#ff7043', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Đăng xuất</button>
            </>
          )}
        </div>
      </header>
      
      <main style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
        {/* Quick Search */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          boxShadow: '0 4px 20px #0001', 
          padding: '2rem',
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff7043', marginBottom: '1rem' }}>Tìm kiếm nhanh</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                padding: '0.8rem 1.2rem', 
                borderRadius: 8, 
                border: '2px solid #e0e0e0', 
                fontSize: 16,
                minWidth: 300,
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff7043'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              onClick={() => setShowSearch(true)}
              style={{
                background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.8rem 2rem',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🔍 Tìm kiếm nưng cao
            </button>
          </div>
        </div>

        {/* Featured Restaurants - Hide when searching for foods */}
        {!search && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: '#ff7043', marginBottom: '1.5rem' }}>Nhà hàng nổi bật</h2>
            {loadingRestaurants ? (
              <div>Đang tải danh sách nhà hàng...</div>
            ) : errorRestaurants ? (
              <div style={{ color: 'red' }}>{errorRestaurants}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {restaurants.slice(0, 4).map((restaurant) => (
                  <div 
                    key={restaurant.id} 
                    onClick={() => setSelectedRestaurantId(restaurant.id)}
                    style={{ 
                      background: '#fff', 
                      borderRadius: 12, 
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px #0001',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px #0001';
                    }}
                  >
                    {restaurant.imageUrl && (
                      <img 
                        src={restaurant.imageUrl} 
                        alt={restaurant.name} 
                        style={{ width: '100%', height: 160, objectFit: 'cover' }} 
                      />
                    )}
                    <div style={{ padding: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, color: '#ff7043', fontSize: '1.1rem' }}>{restaurant.name}</h3>
                        <span style={{ background: '#ffeaa7', padding: '0.2rem 0.5rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 }}>
                          ⭐ {restaurant.rating}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: '#666', margin: '0.5rem 0' }}>{restaurant.description}</p>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: '0.5rem' }}>📍 {restaurant.address}</div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1rem'
                      }}>
                        <span style={{
                          background: '#fff5f0',
                          color: '#ff7043',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {restaurant.category}
                        </span>
                        <span style={{ fontSize: '12px', color: '#888' }}>
                          Click để xem chi tiết →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured Foods */}
        <section>
          <h2 style={{ color: '#ff7043', marginBottom: '1.5rem' }}>
            {search ? `Kết quả tìm kiếm "${search}"` : 'Món ăn nổi bật'}
          </h2>
          {loadingFoods ? (
            <div>Đang tải danh sách món ăn...</div>
          ) : errorFoods ? (
            <div style={{ color: 'red' }}>{errorFoods}</div>
          ) : (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredFoods.length === 0 ? (
                <div style={{ color: '#888', fontSize: 18 }}>Không tìm thấy món ăn phù hợp.</div>
              ) : (
                filteredFoods.map((food) => (
                  <div key={food.id} style={{ width: 260, background: '#fbe9e7', borderRadius: 8, padding: 16, textAlign: 'left', boxShadow: '0 1px 4px #0001', position: 'relative' }}>
                    {food.imageUrl && (
                      <img src={food.imageUrl} alt={food.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
                    )}
                    <div style={{ fontWeight: 600, color: '#ff7043', fontSize: 17 }}>{food.name}</div>
                    <div style={{ fontSize: 15, margin: '6px 0' }}>{food.description}</div>
                    <div style={{ color: '#ff7043', fontWeight: 600, margin: '8px 0 2px' }}>Giá: {food.price.toLocaleString()}₫</div>
                    <div style={{ color: '#ffa726', fontWeight: 500, marginBottom: '1rem' }}>Đánh giá: {food.rating} / 5</div>
                    
                    {user && (
                      <button
                        onClick={() => handleAddToCart(food.id)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.75rem',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        🛒 Thêm vào giỏ
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
      
      <footer style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
        © {new Date().getFullYear()} Food Delivery App
      </footer>

      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
    </div>
  );
}

function HomePage({ user, setUser, showAuth, setShowAuth, authMode, setAuthMode }) {
  return (
    <CartProvider user={user}>
      <HomePageContent 
        user={user}
        setUser={setUser}
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />
    </CartProvider>
  );
}

export default HomePage;