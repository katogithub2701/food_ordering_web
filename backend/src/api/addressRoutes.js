const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const User = require('../models/User');

// Middleware xác thực user (dùng x-user-id tạm thời)
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  req.user = { id: parseInt(userId) };
  next();
};

// Lấy danh sách địa chỉ của user
router.get('/me/addresses', authenticate, async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { userId: req.user.id } });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Thêm địa chỉ mới cho user
router.post('/me/addresses', authenticate, async (req, res) => {
  try {
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
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
