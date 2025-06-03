import React, { useState } from 'react';
import AuthPage from './AuthPage';

function HomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  if (showAuth) {
    return <AuthPage initialMode={authMode} onClose={() => setShowAuth(false)} />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#ff7043', color: '#fff', padding: '2rem 0', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Food Delivery App</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem' }}>Đặt món ăn yêu thích, giao tận nơi nhanh chóng!</p>
        <div style={{ marginTop: 24 }}>
          <button onClick={() => { setShowAuth(true); setAuthMode('login'); }} style={{ background: '#fff', color: '#ff7043', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: 16, marginRight: 12, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}>Đăng nhập</button>
          <button onClick={() => { setShowAuth(true); setAuthMode('register'); }} style={{ background: '#fff', color: '#ff7043', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}>Đăng ký</button>
        </div>
      </header>
      <main style={{ maxWidth: 900, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '2rem' }}>
        <h2 style={{ color: '#ff7043' }}>Món ăn nổi bật</h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[1,2,3].map((id) => (
            <div key={id} style={{ width: 220, background: '#fbe9e7', borderRadius: 8, padding: 16, textAlign: 'center', boxShadow: '0 1px 4px #0001' }}>
              <img src={`https://source.unsplash.com/220x140/?food,meal,${id}`} alt="Món ăn" style={{ width: '100%', borderRadius: 6 }} />
              <h3 style={{ margin: '1rem 0 0.5rem' }}>Món ăn {id}</h3>
              <p style={{ color: '#888', fontSize: 15 }}>Mô tả ngắn về món ăn {id}.</p>
              <button style={{ background: '#ff7043', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', cursor: 'pointer', marginTop: 8 }}>Đặt ngay</button>
            </div>
          ))}
        </div>
      </main>
      <footer style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>
        © {new Date().getFullYear()} Food Delivery App
      </footer>
    </div>
  );
}

export default HomePage;