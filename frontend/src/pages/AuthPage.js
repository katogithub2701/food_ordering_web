import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/authService';

function AuthForm({ isLogin, onSubmit, switchMode }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    ...(isLogin ? {} : { email: '' })
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.username || !form.password || (!isLogin && !form.email)) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setError('');
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #0001', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#ff7043', marginBottom: 24 }}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
      {!isLogin && (
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <label>Tên đăng nhập</label>
        <input type="text" name="username" value={form.username} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Mật khẩu</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <button type="submit" style={{ width: '100%', background: '#ff7043', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <span>{isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
        <button type="button" onClick={switchMode} style={{ background: 'none', border: 'none', color: '#ff7043', marginLeft: 8, cursor: 'pointer', textDecoration: 'underline' }}>{isLogin ? 'Đăng ký' : 'Đăng nhập'}</button>
      </div>
    </form>
  );
}

function AuthPage({ initialMode = 'login', onClose, setUser }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (form) => {
    setLoading(true);
    setMessage('');
    try {
      if (isLogin) {
        const res = await loginUser({ username: form.username, password: form.password });
        setMessage(res.message || 'Đăng nhập thành công!');
        if (res.user) {
          setUser(res.user);
          setTimeout(() => { onClose(); }, 700);
        }
      } else {
        const res = await registerUser({ username: form.username, email: form.email, password: form.password });
        setMessage(res.message || 'Đăng ký thành công! Bạn có thể đăng nhập.');
        setIsLogin(true);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 100 }}>
      <div style={{ position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 22, color: '#ff7043', cursor: 'pointer' }} title="Đóng">×</button>
        <AuthForm isLogin={isLogin} onSubmit={handleAuth} switchMode={() => { setIsLogin(!isLogin); setMessage(''); }} />
        {loading && <div style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>Đang xử lý...</div>}
        {message && <div style={{ textAlign: 'center', marginTop: 18, color: message.includes('thành công') ? 'green' : 'red' }}>{message}</div>}
      </div>
    </div>
  );
}

export default AuthPage;