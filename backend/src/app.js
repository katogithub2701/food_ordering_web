// Entry point for backend

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Đăng ký
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Thiếu thông tin.' });
  try {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 8);
    const user = await User.create({ username, email, password: hash });
    res.json({ message: 'Đăng ký thành công!', user: { username: user.username, email: user.email } });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: 'Tên đăng nhập hoặc email đã tồn tại.' });
    } else {
      res.status(500).json({ message: 'Lỗi server.' });
    }
  }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Thiếu thông tin.' });
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
    const bcrypt = require('bcryptjs');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
    res.json({ message: 'Đăng nhập thành công!', user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

console.log('Backend server starting...');

// Khởi tạo DB và chạy server
(async () => {
  await sequelize.sync();
  app.listen(5000, () => console.log('Backend server running on http://localhost:5000'));
})();
