// Hàm lấy danh sách nhà hàng nổi bật từ backend
export async function fetchRestaurants() {
  const res = await fetch('http://localhost:5000/api/restaurants');
  if (!res.ok) throw new Error('Không lấy được danh sách nhà hàng');
  return res.json();
}
