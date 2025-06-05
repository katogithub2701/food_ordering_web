// Hàm gọi API đăng ký người dùng
export async function registerUser(formData) {
  const res = await fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');
  return data;
}

// Hàm gọi API đăng nhập
export async function loginUser({ username, password }) {
  const res = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
  return data;
}
