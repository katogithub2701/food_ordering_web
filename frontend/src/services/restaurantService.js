// Hàm lấy danh sách nhà hàng nổi bật từ backend
export async function fetchRestaurants() {
  const res = await fetch('http://localhost:5000/api/restaurants');
  if (!res.ok) throw new Error('Không lấy được danh sách nhà hàng');
  return res.json();
}

// Hàm tìm kiếm nhà hàng
export async function searchRestaurants(query, category = 'all', page = 1) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '12'
  });
  
  if (query) params.append('query', query);
  if (category !== 'all') params.append('category', category);
  
  const res = await fetch(`http://localhost:5000/api/restaurants/search?${params}`);
  if (!res.ok) throw new Error('Không thể tìm kiếm nhà hàng');
  return res.json();
}

// Hàm lấy danh sách categories
export async function fetchCategories() {
  const res = await fetch('http://localhost:5000/api/categories');
  if (!res.ok) throw new Error('Không lấy được danh sách categories');
  return res.json();
}
