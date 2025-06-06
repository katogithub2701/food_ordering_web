import React, { useState } from 'react';
import { loginUser } from '../services/authService';
import RegistrationPage from './RegistrationPage';
import '../styles/AuthPage.css';

function LoginForm({ onSubmit, onShowRegistration, loading, message }) {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setError('');
    onSubmit(form);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
        <h2 className="auth-title">Đăng nhập</h2>
      </div>
      
      <div className="auth-field">
        <label htmlFor="username">Tên đăng nhập</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          value={form.username} 
          onChange={handleChange} 
          className="auth-input" 
          autoComplete="username"
          placeholder="Nhập tên đăng nhập"
        />
      </div>
      
      <div className="auth-field">
        <label htmlFor="password">Mật khẩu</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          value={form.password} 
          onChange={handleChange} 
          className="auth-input" 
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
        />
      </div>
      
      {(error || message) && (
        <div className={error ? 'auth-error' : message.includes('thành công') ? 'auth-success' : 'auth-error'}>
          {error || message}
        </div>
      )}
      
      <button type="submit" className="auth-btn-main" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
      
      <div className="auth-switch">
        <span>Chưa có tài khoản?</span>
        <button type="button" className="auth-btn-switch" onClick={onShowRegistration}>
          Đăng ký
        </button>
      </div>
    </form>
  );
}

function AuthPage({ initialMode = 'login', onClose, setUser }) {
  const [currentView, setCurrentView] = useState(initialMode === 'restaurant' ? 'registration' : 'login'); // 'login' or 'registration'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (form) => {
    setLoading(true);
    setMessage('');
    
    try {
      const res = await loginUser({ username: form.username, password: form.password });
      setMessage(res.message || 'Đăng nhập thành công!');
      
      if (res.user && res.token) {
        const userWithToken = { ...res.user, token: res.token };
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', res.token);
        
        setTimeout(() => { 
          onClose(); 
        }, 1000);
      } else {
        setMessage('Đăng nhập thất bại: Không nhận được token.');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRegistration = () => {
    setCurrentView('registration');
    setMessage('');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setMessage('');
  };  // Show registration page
  if (currentView === 'registration') {
    return <RegistrationPage onClose={handleBackToLogin} setUser={setUser} initialMode={initialMode === 'restaurant' ? 'restaurant' : 'roleSelection'} />;
  }

  // Show login page
  return (
    <div className="auth-modal-bg">
      <div className="auth-modal">
        <button onClick={onClose} className="auth-close-btn" title="Đóng">×</button>
        
        <LoginForm 
          onSubmit={handleLogin} 
          onShowRegistration={handleShowRegistration}
          loading={loading}
          message={message}
        />
        
        {loading && <div className="auth-loading">Đang xử lý...</div>}
      </div>
    </div>
  );
}

export default AuthPage;