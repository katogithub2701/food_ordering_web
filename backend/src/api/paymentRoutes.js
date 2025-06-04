require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const crypto = require('crypto');

// Định nghĩa các trạng thái đơn hàng liên quan đến thanh toán
const ORDER_PAYMENT_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
};

// Helper: build VNPay payment URL
function buildVnpayUrl({ orderId, amount, orderInfo, returnUrl, ipnUrl }) {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_PAYMENT_URL;
  const vnpReturnUrl = returnUrl || process.env.VNPAY_RETURN_URL;
  const vnpIpnUrl = ipnUrl || process.env.VNPAY_IPN_URL;
  const createDate = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const txnRef = `${orderId}_${Date.now()}`;

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: amount * 100, // VNPay yêu cầu đơn vị là VND * 100
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: vnpReturnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: createDate,
    vnp_IpnUrl: vnpIpnUrl
  };
  // Sắp xếp tham số theo thứ tự alpha
  vnp_Params = Object.fromEntries(Object.entries(vnp_Params).sort());
  // Tạo chuỗi query
  const signData = Object.entries(vnp_Params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  // Tạo checksum
  const secureHash = crypto.createHmac('sha512', secretKey).update(signData).digest('hex');
  vnp_Params.vnp_SecureHash = secureHash;
  // Build URL
  const url = vnpUrl + '?' + Object.entries(vnp_Params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return url;
}

// Khởi tạo giao dịch thanh toán VNPay
router.post('/orders/:orderId/payments/initiate', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { orderId } = req.params;
    const { paymentMethod, returnUrl } = req.body;
    if (paymentMethod !== 'VNPAY') return res.status(400).json({ message: 'Chỉ hỗ trợ VNPay demo.' });
    // Lấy đơn hàng
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    if (order.userId !== parseInt(userId)) return res.status(403).json({ message: 'Không có quyền thanh toán đơn này.' });
    // Sinh URL thanh toán
    const paymentUrl = buildVnpayUrl({
      orderId: order.id,
      amount: order.total,
      orderInfo: `Thanh toan don hang #${order.id}`,
      returnUrl
    });
    res.json({ paymentUrl });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// IPN handler cho VNPay
router.get('/payments/ipn/vnpay', async (req, res) => {
  try {
    const params = req.query;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    const vnp_SecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    const sortedParams = Object.fromEntries(Object.entries(params).sort());
    const signData = Object.entries(sortedParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    const checkHash = crypto.createHmac('sha512', secretKey).update(signData).digest('hex');
    if (vnp_SecureHash !== checkHash) {
      return res.status(400).send('INVALID CHECKSUM');
    }
    const orderId = params.vnp_TxnRef ? params.vnp_TxnRef.split('_')[0] : null;
    if (!orderId) return res.status(400).send('INVALID ORDER');
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).send('ORDER NOT FOUND');
    // Nếu đơn hàng đã PAID hoặc PAYMENT_FAILED thì không xử lý lại
    if ([ORDER_PAYMENT_STATUS.PAID, ORDER_PAYMENT_STATUS.PAYMENT_FAILED].includes(order.status)) {
      // Có thể log IPN trùng lặp ở đây
      return res.status(200).send('OK');
    }
    const amount = parseInt(params.vnp_Amount) / 100;
    if (order.total !== amount) {
      order.status = ORDER_PAYMENT_STATUS.PAYMENT_ERROR;
      order.customerNotes = `[VNPay] Sai lệch số tiền: nhận ${amount}, đơn hàng ${order.total}`;
      await order.save();
      return res.status(400).send('INVALID AMOUNT');
    }
    // Xử lý các kịch bản trạng thái
    if (params.vnp_ResponseCode === '00') {
      order.status = ORDER_PAYMENT_STATUS.PAID;
      order.customerNotes = '[VNPay] Thanh toán thành công';
      await order.save();
    } else if (params.vnp_ResponseCode === '24') {
      order.status = ORDER_PAYMENT_STATUS.PAYMENT_FAILED;
      order.customerNotes = '[VNPay] Giao dịch bị hủy bởi người dùng';
      await order.save();
    } else if (params.vnp_ResponseCode === 'pending') {
      order.status = ORDER_PAYMENT_STATUS.PENDING_PAYMENT;
      order.customerNotes = '[VNPay] Giao dịch đang chờ xử lý';
      await order.save();
    } else {
      order.status = ORDER_PAYMENT_STATUS.PAYMENT_FAILED;
      order.customerNotes = `[VNPay] Lỗi thanh toán: code ${params.vnp_ResponseCode}`;
      await order.save();
    }
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('ERROR');
  }
});

module.exports = router;
