const { PrismaClient } = require('@prisma/client');
const { generateQRData } = require('../utils/helpers');
const { emitOrderUpdate } = require('../socket');

const prisma = new PrismaClient();

async function processPayment(req, res, next) {
  try {
    const { orderId, success } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: { select: { id: true, name: true } },
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
      },
    });

    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ message: 'Order is not pending payment.' });
    }

    if (success) {
      const qrDataUrl = await generateQRData(order.id, order.orderCode);

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'SUCCESS',
          paymentMethod: 'UPI',
          transactionRef: `TXN${Date.now()}`,
        },
        include: {
          customer: { select: { id: true, username: true } },
          restaurant: { select: { id: true, name: true } },
          items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        },
      });

      const notification = await prisma.notification.create({
        data: {
          message: 'Payment successful! Your order has been placed.',
          type: 'PAYMENT_SUCCESS',
          userId: order.customerId,
          orderId: order.id,
        },
      });

      emitOrderUpdate(req.app.get('io'), orderId, { ...updated, notification });

      res.json({
        success: true,
        order: updated,
        qrCode: qrDataUrl,
        message: 'Payment successful!',
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAYMENT_FAILED', paymentStatus: 'FAILED' },
      });

      emitOrderUpdate(req.app.get('io'), orderId, { id: orderId, status: 'PAYMENT_FAILED' });

      res.json({ success: false, message: 'Payment failed. Please try again.' });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { processPayment };