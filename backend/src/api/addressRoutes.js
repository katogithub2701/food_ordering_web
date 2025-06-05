const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách địa chỉ của user
router.get('/me/addresses', authenticateToken, async (req, res) => {
  try {
    console.log('[GET ADDRESSES] userId:', req.user.id);
    const addresses = await Address.findAll({ where: { userId: req.user.id } });
    console.log('[GET ADDRESSES] found:', addresses.length);
    res.json(addresses);
  } catch (err) {
    console.error('[GET ADDRESSES] error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Thêm địa chỉ mới cho user
router.post('/me/addresses', authenticateToken, async (req, res) => {
  try {
    console.log('[POST ADDRESS] userId:', req.user.id, 'body:', req.body);
    const { fullName, phone, street, ward, district, province } = req.body;
    if (!fullName || !phone || !street || !district || !province) {
      return res.status(400).json({ message: 'Thiếu thông tin địa chỉ.' });
    }
    const address = await Address.create({
      userId: req.user.id,
      fullName,
      phone,
      street,
      ward,
      district,
      province
    });
    console.log('[POST ADDRESS] created:', address.id);
    res.status(201).json(address);
  } catch (err) {
    console.error('[POST ADDRESS] error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
