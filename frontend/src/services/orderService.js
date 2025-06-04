// Hàm lấy danh sách đơn hàng (có phân trang, lọc, JWT)
export async function fetchOrders({ token, page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'DESC', startDate, endDate }) {
  const params = new URLSearchParams({
    page,
    limit,
    sortBy,
    sortOrder
  });
  if (status && status !== 'all') params.append('status', status);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await fetch(`http://localhost:5000/api/orders?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Không lấy được danh sách đơn hàng');
  return res.json();
}

// Hàm lấy chi tiết đơn hàng (JWT)
export async function fetchOrderDetail(orderId, token) {
  const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Không lấy được chi tiết đơn hàng');
  return res.json();
}
