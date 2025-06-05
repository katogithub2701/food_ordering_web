import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/authService';
import '../styles/AuthPage.css';

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
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-title">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
      {!isLogin && (
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange} className="auth-input" autoComplete="email" />
        </div>
      )}
      <div className="auth-field">
        <label htmlFor="username">Tên đăng nhập</label>
        <input type="text" id="username" name="username" value={form.username} onChange={handleChange} className="auth-input" autoComplete="username" />
      </div>
      <div className="auth-field">
        <label htmlFor="password">Mật khẩu</label>
        <input type="password" id="password" name="password" value={form.password} onChange={handleChange} className="auth-input" autoComplete={isLogin ? 'current-password' : 'new-password'} />
      </div>
      {error && <div className="auth-error">{error}</div>}
      <button type="submit" className="auth-btn-main">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
      <div className="auth-switch">
        <span>{isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
        <button type="button" className="auth-btn-switch" onClick={switchMode}>{isLogin ? 'Đăng ký' : 'Đăng nhập'}</button>
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
        if (res.user && res.token) {
          const userWithToken = { ...res.user, token: res.token };
          setUser(userWithToken);
          localStorage.setItem('user', JSON.stringify(userWithToken));
          localStorage.setItem('token', res.token); // Lưu token riêng để các nơi khác lấy dễ
          setTimeout(() => { onClose(); }, 700);
        } else {
          setMessage('Đăng nhập thất bại: Không nhận được token.');
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
    <div className="auth-modal-bg">
      <div className="auth-modal">
        <button onClick={onClose} className="auth-close-btn" title="Đóng">×</button>
        {/* Optionally add a logo or illustration here */}
        <AuthForm isLogin={isLogin} onSubmit={handleAuth} switchMode={() => { setIsLogin(!isLogin); setMessage(''); }} />
        {loading && <div className="auth-loading">Đang xử lý...</div>}
        {message && <div className={message.includes('thành công') ? 'auth-success' : 'auth-error'}>{message}</div>}
      </div>
    </div>
  );
}

export default AuthPage;