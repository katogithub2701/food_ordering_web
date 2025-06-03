import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import { fetchFoods } from '../services/foodService';

function HomePage({ user, setUser, showAuth, setShowAuth, authMode, setAuthMode }) {
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [errorFoods, setErrorFoods] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFoods()
      .then(setFoods)
      .catch(() => setErrorFoods('Không lấy được danh sách món ăn'))
      .finally(() => setLoadingFoods(false));
  }, []);

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(search.toLowerCase()) ||
    food.description.toLowerCase().includes(search.toLowerCase())
  );

  if (showAuth) {
    return <AuthPage initialMode={authMode} onClose={() => setShowAuth(false)} setUser={setUser} />;
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
              <button onClick={() => setUser(null)} style={{ background: '#fff', color: '#ff7043', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Đăng xuất</button>
            </>
          )}
        </div>
      </header>
      <main style={{ maxWidth: 900, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '2rem' }}>
        <div style={{ margin: '0 0 32px', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 320, padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
        </div>
        <h2 style={{ color: '#ff7043' }}>Món ăn nổi bật</h2>
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
                <div key={food.id} style={{ width: 260, background: '#fbe9e7', borderRadius: 8, padding: 16, textAlign: 'left', boxShadow: '0 1px 4px #0001' }}>
                  {food.imageUrl && (
                    <img src={food.imageUrl} alt={food.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
                  )}
                  <div style={{ fontWeight: 600, color: '#ff7043', fontSize: 17 }}>{food.name}</div>
                  <div style={{ fontSize: 15, margin: '6px 0' }}>{food.description}</div>
                  <div style={{ color: '#ff7043', fontWeight: 600, margin: '8px 0 2px' }}>Giá: {food.price.toLocaleString()}₫</div>
                  <div style={{ color: '#ffa726', fontWeight: 500 }}>Đánh giá: {food.rating} / 5</div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <footer style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
        © {new Date().getFullYear()} Food Delivery App
      </footer>
    </div>
  );
}

export default HomePage;