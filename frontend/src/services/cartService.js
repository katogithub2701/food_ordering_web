// Service cho giỏ hàng

export async function fetchCart(username) {
  try {
    const res = await fetch(`http://localhost:5000/api/cart?username=${encodeURIComponent(username)}`);
    
    // Kiểm tra nếu response không phải JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server không trả về JSON response');
    }
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Không lấy được giỏ hàng');
    }
    
    return res.json();
  } catch (error) {
    console.error('Fetch cart error:', error);
    throw new Error('Không thể kết nối đến server');
  }
}

export async function addToCart(username, foodId, quantity = 1) {
  try {
    const res = await fetch('http://localhost:5000/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, foodId, quantity })
    });
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server không trả về JSON response');
    }
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể thêm vào giỏ hàng');
    return data;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw new Error('Không thể thêm vào giỏ hàng');
  }
}

export async function updateCartItem(username, cartItemId, quantity) {
  try {
    const res = await fetch('http://localhost:5000/api/cart/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, cartItemId, quantity })
    });
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server không trả về JSON response');
    }
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể cập nhật giỏ hàng');
    return data;
  } catch (error) {
    console.error('Update cart item error:', error);
    throw new Error('Không thể cập nhật giỏ hàng');
  }
}

export async function removeFromCart(username, cartItemId) {
  try {
    const res = await fetch('http://localhost:5000/api/cart/remove', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, cartItemId })
    });
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server không trả về JSON response');
    }
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể xóa khỏi giỏ hàng');
    return data;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw new Error('Không thể xóa khỏi giỏ hàng');
  }
}

export async function clearCart(username) {
  try {
    const res = await fetch('http://localhost:5000/api/cart/clear', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server không trả về JSON response');
    }
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể xóa giỏ hàng');
    return data;
  } catch (error) {
    console.error('Clear cart error:', error);
    throw new Error('Không thể xóa giỏ hàng');
  }
}
