// Hàm lấy danh sách đơn hàng của user
export async function fetchOrders(username) {
  const res = await fetch(`http://localhost:5000/api/orders?username=${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error('Không lấy được danh sách đơn hàng');
  return res.json();
}
