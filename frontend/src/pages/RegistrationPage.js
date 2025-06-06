import React, { useState, useEffect } from 'react';
import { registerUser } from '../services/authService';
import '../styles/AuthPage.css';

// Role Selection Component
function RoleSelection({ onRoleSelect, onBack }) {
  return (
    <div className="auth-modal-bg">
      <div className="auth-modal">
        <button onClick={onBack} className="auth-close-btn" title="Đóng">×</button>
        
        <div className="auth-form">
          <h2 className="auth-title">Chọn loại tài khoản</h2>
          <p style={{ color: '#666', marginBottom: '2rem', textAlign: 'center' }}>
            Bạn muốn đăng ký tài khoản nào?
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => onRoleSelect('customer')}
              style={{
                padding: '1.5rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#ff7043';
                e.target.style.background = '#fff5f0';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.background = '#fff';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>👤</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#333' }}>
                    Khách hàng
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Đặt món ăn từ các nhà hàng yêu thích
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => onRoleSelect('restaurant')}
              style={{
                padding: '1.5rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#ff7043';
                e.target.style.background = '#fff5f0';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.background = '#fff';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>🏪</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#333' }}>
                    Nhà hàng
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Quản lý nhà hàng và nhận đơn hàng
                  </div>
                </div>
              </div>
            </button>
          </div>
          
          <div className="auth-switch">
            <span>Đã có tài khoản?</span>
            <button type="button" className="auth-btn-switch" onClick={onBack}>
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Customer Registration Form
function CustomerRegistrationForm({ onSubmit, onBack, loading, message }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    
    setError('');
    onSubmit({
      username: form.username,
      email: form.email,
      password: form.password,
      role: 'customer'
    });
  };

  return (
    <div className="auth-modal-bg">
      <div className="auth-modal">
        <button onClick={onBack} className="auth-close-btn" title="Đóng">×</button>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
            <h2 className="auth-title">Đăng ký tài khoản khách hàng</h2>
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
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              className="auth-input" 
              autoComplete="email"
              placeholder="Nhập địa chỉ email"
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
              autoComplete="new-password"
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            />
          </div>
          
          <div className="auth-field">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              className="auth-input" 
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
            />
          </div>
          
          {(error || message) && (
            <div className={error ? 'auth-error' : message.includes('thành công') ? 'auth-success' : 'auth-error'}>
              {error || message}
            </div>
          )}
          
          <button type="submit" className="auth-btn-main" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
          
          <div className="auth-switch">
            <span>Đã có tài khoản?</span>
            <button type="button" className="auth-btn-switch" onClick={onBack}>
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Restaurant Registration Form
function RestaurantRegistrationForm({ onSubmit, onBack, loading, message }) {  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    restaurantDescription: '',
    restaurantCategory: 'Tổng hợp',
    restaurantImageUrl: '',
    openTime: '06:00',
    closeTime: '22:00'
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = e => {
    e.preventDefault();
    
    if (!form.username || !form.email || !form.password || !form.confirmPassword || 
        !form.restaurantName || !form.restaurantAddress) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    
    setError('');    onSubmit({
      username: form.username,
      email: form.email,
      password: form.password,
      role: 'restaurant',      restaurantData: {
        name: form.restaurantName,
        address: form.restaurantAddress,
        phone: form.restaurantPhone,
        description: form.restaurantDescription,
        category: form.restaurantCategory,
        imageUrl: form.restaurantImageUrl,
        openTime: form.openTime,
        closeTime: form.closeTime
      }
    });
  };  return (
    <div className="auth-modal-bg">
      <div className="auth-modal restaurant-modal">
        <button onClick={onBack} className="auth-close-btn" title="Đóng">×</button>
        
        <form className="auth-form restaurant-form" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏪</div>
            <h2 className="auth-title" style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Đăng ký tài khoản nhà hàng</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Tạo tài khoản để quản lý nhà hàng của bạn</p>
          </div>
          
          <div className="form-container">
            {/* Thông tin tài khoản */}
            <div className="form-section">
              <div className="section-title">
                👤 Thông tin đăng nhập
              </div>
              
              <div className="form-row">
                <div className="auth-field compact">
                  <label htmlFor="username">Tên đăng nhập *</label>
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    value={form.username} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    autoComplete="username"
                    placeholder="Tên đăng nhập"
                    required
                  />
                </div>
                
                <div className="auth-field compact">
                  <label htmlFor="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    autoComplete="email"
                    placeholder="Email đăng nhập"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="auth-field compact">
                  <label htmlFor="password">Mật khẩu *</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    autoComplete="new-password"
                    placeholder="Ít nhất 6 ký tự"
                    required
                  />
                </div>
                
                <div className="auth-field compact">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Thông tin nhà hàng */}
            <div className="form-section">
              <div className="section-title">
                🏪 Thông tin nhà hàng
              </div>
              
              <div className="form-row">
                <div className="auth-field compact">
                  <label htmlFor="restaurantName">Tên nhà hàng *</label>
                  <input 
                    type="text" 
                    id="restaurantName" 
                    name="restaurantName" 
                    value={form.restaurantName} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    placeholder="Tên nhà hàng"
                    required
                  />
                </div>
                
                <div className="auth-field compact">
                  <label htmlFor="restaurantCategory">Loại hình</label>
                  <select 
                    id="restaurantCategory" 
                    name="restaurantCategory" 
                    value={form.restaurantCategory} 
                    onChange={handleChange} 
                    className="auth-input compact"
                  >
                    <option value="Tổng hợp">Tổng hợp</option>
                    <option value="Món Việt">Món Việt</option>
                    <option value="Món Á">Món Á</option>
                    <option value="Món Âu">Món Âu</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Đồ uống">Đồ uống</option>
                    <option value="Chay">Chay</option>
                    <option value="Hải sản">Hải sản</option>
                    <option value="Bánh kẹo">Bánh kẹo</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row single">
                <div className="auth-field compact">
                  <label htmlFor="restaurantAddress">Địa chỉ nhà hàng *</label>
                  <input 
                    type="text" 
                    id="restaurantAddress" 
                    name="restaurantAddress" 
                    value={form.restaurantAddress} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    placeholder="Địa chỉ đầy đủ của nhà hàng"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="auth-field compact">
                  <label htmlFor="restaurantPhone">Số điện thoại</label>
                  <input 
                    type="tel" 
                    id="restaurantPhone" 
                    name="restaurantPhone" 
                    value={form.restaurantPhone} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
                
                <div className="auth-field compact">
                  <label htmlFor="restaurantImageUrl">URL ảnh đại diện</label>
                  <input 
                    type="url" 
                    id="restaurantImageUrl" 
                    name="restaurantImageUrl" 
                    value={form.restaurantImageUrl} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="auth-field compact">
                  <label htmlFor="openTime">Giờ mở cửa</label>
                  <input 
                    type="time" 
                    id="openTime" 
                    name="openTime" 
                    value={form.openTime} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                  />
                </div>
                
                <div className="auth-field compact">
                  <label htmlFor="closeTime">Giờ đóng cửa</label>
                  <input 
                    type="time" 
                    id="closeTime" 
                    name="closeTime" 
                    value={form.closeTime} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                  />
                </div>
              </div>
              
              <div className="form-row single">
                <div className="auth-field compact">
                  <label htmlFor="restaurantDescription">Mô tả nhà hàng</label>
                  <textarea 
                    id="restaurantDescription" 
                    name="restaurantDescription" 
                    value={form.restaurantDescription} 
                    onChange={handleChange} 
                    className="auth-input compact" 
                    placeholder="Mô tả ngắn về nhà hàng, đặc sản, không gian..."
                    rows="3"
                    style={{ resize: 'vertical', minHeight: '80px' }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            {(error || message) && (
              <div className={error ? 'auth-error' : message.includes('thành công') ? 'auth-success' : 'auth-error'}>
                {error || message}
              </div>
            )}
            
            <button type="submit" className="auth-btn-main" disabled={loading} style={{ padding: '16px', fontSize: '1.1rem', fontWeight: '700' }}>
              {loading ? 'Đang đăng ký...' : '🚀 Đăng ký nhà hàng'}
            </button>
            
            <div className="auth-switch">
              <span>Đã có tài khoản?</span>
              <button type="button" className="auth-btn-switch" onClick={onBack}>
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Registration Page Component
function RegistrationPage({ onClose, setUser, initialMode = 'roleSelection' }) {
  const [currentStep, setCurrentStep] = useState(initialMode); // roleSelection, customer, restaurant
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setCurrentStep(role);
    setMessage('');
  };

  const handleRegistration = async (formData) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await registerUser(formData);
      setMessage(response.message || 'Đăng ký thành công! Bạn có thể đăng nhập.');
      
      // Auto redirect to login after successful registration
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setMessage(err.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'roleSelection') {
      onClose();
    } else {
      setCurrentStep('roleSelection');
      setMessage('');
    }
  };

  // Render appropriate component based on current step
  switch (currentStep) {
    case 'customer':
      return (
        <CustomerRegistrationForm
          onSubmit={handleRegistration}
          onBack={handleBack}
          loading={loading}
          message={message}
        />
      );
    
    case 'restaurant':
      return (
        <RestaurantRegistrationForm
          onSubmit={handleRegistration}
          onBack={handleBack}
          loading={loading}
          message={message}
        />
      );
    
    default:
      return (
        <RoleSelection
          onRoleSelect={handleRoleSelect}
          onBack={handleBack}
        />
      );
  }
}

export default RegistrationPage;
