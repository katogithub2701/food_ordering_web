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
    <div>
      <h2>Nhập/Chọn địa chỉ giao hàng</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Họ tên người nhận *</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <label>Số điện thoại *</label>
        <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <label>Địa chỉ (đường, số nhà) *</label>
        <input name="street" value={form.street} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <label>Tỉnh/Thành phố *</label>
        <select name="province" value={form.province} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
          <option value="">-- Chọn Tỉnh/Thành phố --</option>
          {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
        </select>
        <label>Quận/Huyện *</label>
        <select name="district" value={form.district} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
          <option value="">-- Chọn Quận/Huyện --</option>
          {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
        </select>
        <label>Phường/Xã</label>
        <input name="ward" value={form.ward} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {/* Danh sách địa chỉ đã lưu */}
      {savedAddresses.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Chọn địa chỉ đã lưu:</label>
          <div>
            {savedAddresses.map(addr => (
              <label key={addr.id} style={{ display: 'block', marginBottom: 4, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="savedAddress"
                  value={addr.id}
                  checked={selectedAddressId === String(addr.id)}
                  onChange={e => setSelectedAddressId(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                {addr.fullName}, {addr.phone}, {addr.street}, {addr.ward ? addr.ward + ', ' : ''}{addr.district}, {addr.province}
              </label>
            ))}
            <label style={{ display: 'block', marginTop: 4 }}>
              <input
                type="radio"
                name="savedAddress"
                value=""
                checked={selectedAddressId === ''}
                onChange={() => setSelectedAddressId('')}
                style={{ marginRight: 8 }}
              />
              Nhập địa chỉ mới
            </label>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={{ padding: '10px 24px', borderRadius: 6 }}>Quay lại</button>
        <button onClick={handleNext} style={{ background: '#ff7043', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>Tiếp tục</button>
      </div>
      {/* Checkbox lưu địa chỉ mới */}
      {selectedAddressId === '' && (
        <div style={{ margin: '8px 0 16px 0' }}>
          <label>
            <input type="checkbox" checked={saveNew} onChange={e => setSaveNew(e.target.checked)} style={{ marginRight: 8 }} />
            Lưu địa chỉ này cho lần sau
          </label>
        </div>
      )}
    </div>
  );
};

export default CheckoutAddressStep;
