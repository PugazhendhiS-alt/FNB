const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { generateQRData } = require('../utils/helpers');
const { emitOrderUpdate, emitNotification, emitStaffNotification, emitDashboardUpdate } = require('../socket');

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
    if (order.customerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only pay for your own orders.' });
    }
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
          transactionRef: `TXN${uuidv4().slice(0, 8).toUpperCase()}`,
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

      const io = req.app.get('io');
      emitOrderUpdate(io, orderId, { ...updated, notification });
      emitDashboardUpdate(io, 'payment_success', { restaurantId: order.restaurantId });
      emitNotification(io, order.customerId, notification);

      const staffUsers = await prisma.user.findMany({
        where: {
          restaurantId: order.restaurantId,
          role: { in: ['CHEF', 'RESTAURANT_MANAGER'] },
        },
        select: { id: true },
      });
      for (const staff of staffUsers) {
        const sn = await prisma.notification.create({
          data: {
            message: `New order #${updated.orderCode} from ${updated.customer?.username || 'Guest'}`,
            type: 'NEW_ORDER',
            orderId: order.id,
            userId: staff.id,
          },
        });
        emitNotification(io, staff.id, sn);
      }

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

      emitOrderUpdate(req.app.get('io'), orderId, { id: orderId, status: 'PAYMENT_FAILED', restaurantId: order.restaurantId });
      emitDashboardUpdate(req.app.get('io'), 'payment_failed', { restaurantId: order.restaurantId });

      res.json({ success: false, message: 'Payment failed. Please try again.' });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { processPayment };