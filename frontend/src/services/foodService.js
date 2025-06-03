// Hàm lấy danh sách món ăn từ backend
export async function fetchFoods() {
  const res = await fetch('http://localhost:5000/api/foods');
  if (!res.ok) throw new Error('Không lấy được danh sách món ăn');
  return res.json();
}
