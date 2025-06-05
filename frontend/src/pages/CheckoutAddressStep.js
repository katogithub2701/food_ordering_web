import React, { useState, useEffect } from 'react';
import { getProvinces, getDistrictsByProvinceCode } from 'sub-vn';

const CheckoutAddressStep = ({ deliveryAddress, setDeliveryAddress, onNext, onBack }) => {
  const [form, setForm] = useState(deliveryAddress || {
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    province: '',
    district: ''
  });
  const [error, setError] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [saveNew, setSaveNew] = useState(false);

  // Load danh sách tỉnh/thành khi mount
  useEffect(() => {
    setProvinces(getProvinces());
  }, []);

  // Khi chọn tỉnh/thành, load quận/huyện tương ứng
  useEffect(() => {
    const selected = provinces.find(p => p.name === form.province);
    if (selected) {
      setDistricts(getDistrictsByProvinceCode(selected.code));
    } else {
      setDistricts([]);
      setForm(f => ({ ...f, district: '' }));
    }
  }, [form.province, provinces]);

  // Lấy danh sách địa chỉ đã lưu khi load
  useEffect(() => {
    fetch('http://localhost:5000/api/users/me/addresses', {
      headers: { 'x-user-id': 1 }
    })
      .then(res => res.json())
      .then(data => setSavedAddresses(Array.isArray(data) ? data : []));
  }, []);

  // Khi chọn địa chỉ đã lưu
  useEffect(() => {
    if (selectedAddressId) {
      const addr = savedAddresses.find(a => a.id === parseInt(selectedAddressId));
      if (addr) setForm({
        fullName: addr.fullName,
        phone: addr.phone,
        street: addr.street,
        ward: addr.ward || '',
        province: addr.province,
        district: addr.district
      });
    }
  }, [selectedAddressId, savedAddresses]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.fullName || !form.phone || !form.street || !form.district || !form.province) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return false;
    }
    if (!/^0\d{9,10}$/.test(form.phone)) {
      setError('Số điện thoại không hợp lệ.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = async () => {
    if (validate()) {
      setDeliveryAddress(form);
      // Nếu là địa chỉ mới và muốn lưu lại
      if (saveNew && !selectedAddressId) {
        await fetch('http://localhost:5000/api/users/me/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': 1 },
          body: JSON.stringify(form)
        });
      }
      onNext();
    }
  };
  return (
    <div style={{ padding: '32px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        📍 Thông tin giao hàng
      </div>

      {/* Saved Addresses Section */}
      {savedAddresses.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#333',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Địa chỉ đã lưu
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {savedAddresses.map(addr => (
              <label 
                key={addr.id} 
                style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  background: selectedAddressId === String(addr.id) 
                    ? 'linear-gradient(135deg, #667eea20, #764ba220)' 
                    : '#f8f9fa',
                  border: selectedAddressId === String(addr.id) 
                    ? '2px solid #667eea' 
                    : '2px solid transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (selectedAddressId !== String(addr.id)) {
                    e.target.style.background = '#f0f0f0';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAddressId !== String(addr.id)) {
                    e.target.style.background = '#f8f9fa';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  value={addr.id}
                  checked={selectedAddressId === String(addr.id)}
                  onChange={e => setSelectedAddressId(e.target.value)}
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    accentColor: '#667eea',
                    marginTop: '2px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    {addr.fullName} • {addr.phone}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                    {addr.street}, {addr.ward ? addr.ward + ', ' : ''}{addr.district}, {addr.province}
                  </div>
                </div>
                {selectedAddressId === String(addr.id) && (
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    position: 'absolute',
                    top: '8px',
                    right: '8px'
                  }}>
                    ✓ Đã chọn
                  </div>
                )}
              </label>
            ))}
            <label 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: selectedAddressId === '' 
                  ? 'linear-gradient(135deg, #667eea20, #764ba220)' 
                  : '#f8f9fa',
                border: selectedAddressId === '' 
                  ? '2px solid #667eea' 
                  : '2px solid transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedAddressId !== '') {
                  e.target.style.background = '#f0f0f0';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedAddressId !== '') {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <input
                type="radio"
                name="savedAddress"
                value=""
                checked={selectedAddressId === ''}
                onChange={() => setSelectedAddressId('')}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  accentColor: '#667eea'
                }}
              />
              <div style={{ fontWeight: '600', color: '#667eea' }}>
                ➕ Nhập địa chỉ mới
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Address Form Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#333',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✏️ Thông tin địa chỉ
        </h3>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '14px'
              }}>
                Họ tên người nhận *
              </label>
              <input 
                name="fullName" 
                value={form.fullName} 
                onChange={handleChange} 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '14px'
              }}>
                Số điện thoại *
              </label>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#333',
              fontSize: '14px'
            }}>
              Địa chỉ (đường, số nhà) *
            </label>
            <input 
              name="street" 
              value={form.street} 
              onChange={handleChange} 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e5e9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '14px'
              }}>
                Tỉnh/Thành phố *
              </label>
              <select 
                name="province" 
                value={form.province} 
                onChange={handleChange} 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '14px'
              }}>
                Quận/Huyện *
              </label>
              <select 
                name="district" 
                value={form.district} 
                onChange={handleChange} 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">-- Chọn Quận/Huyện --</option>
                {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#333',
              fontSize: '14px'
            }}>
              Phường/Xã
            </label>
            <input 
              name="ward" 
              value={form.ward} 
              onChange={handleChange} 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e5e9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Address Checkbox */}
      {selectedAddressId === '' && (
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea10, #764ba210)',
          borderRadius: '12px',
          border: '1px solid #667eea30'
        }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#333'
          }}>
            <input 
              type="checkbox" 
              checked={saveNew} 
              onChange={e => setSaveNew(e.target.checked)} 
              style={{ 
                width: '18px', 
                height: '18px', 
                accentColor: '#667eea'
              }} 
            />
            💾 Lưu địa chỉ này cho lần sau
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ 
          background: 'linear-gradient(135deg, #ff6b6b20, #ee5a5220)',
          color: '#d63031',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #ff6b6b40',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button 
          onClick={onBack} 
          style={{ 
            padding: '12px 32px', 
            borderRadius: '8px',
            border: '2px solid #e1e5e9',
            background: 'white',
            color: '#666',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.color = '#667eea';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e1e5e9';
            e.target.style.color = '#666';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Quay lại
        </button>
        <button 
          onClick={handleNext} 
          style={{ 
            background: 'linear-gradient(135deg, #667eea, #764ba2)', 
            color: '#fff', 
            padding: '12px 32px', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '600', 
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
};

export default CheckoutAddressStep;
