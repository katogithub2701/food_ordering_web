// Hàm lấy danh sách món ăn từ backend
export async function fetchFoods() {
  const res = await fetch('http://localhost:5000/api/foods');
  if (!res.ok) throw new Error('Không lấy được danh sách món ăn');
  return res.json();
}

// Hàm tìm kiếm món ăn
export async function searchFoods(query, category = 'all', page = 1) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '12'
  });
  
  if (query) params.append('query', query);
  if (category !== 'all') params.append('category', category);
  
  const res = await fetch(`http://localhost:5000/api/foods/search?${params}`);
  if (!res.ok) throw new Error('Không thể tìm kiếm món ăn');
  return res.json();
}

// Hàm lấy danh sách categories của món ăn
export async function fetchFoodCategories() {
  const res = await fetch('http://localhost:5000/api/foods/categories');
  if (!res.ok) throw new Error('Không lấy được danh sách categories món ăn');
  return res.json();
}
