const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

function generateOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function generateQRData(orderId, orderCode) {
  const data = JSON.stringify({ orderId, orderCode });
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    return qrDataUrl;
  } catch {
    return null;
  }
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { generateOrderCode, generateQRData, calculateTotal, generateOtpCode };