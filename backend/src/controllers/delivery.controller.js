const { PrismaClient } = require('@prisma/client');
const { emitOrderUpdate, emitNotification } = require('../socket');

const prisma = new PrismaClient();

async function confirmDelivery(req, res, next) {
  try {
    const { orderCode } = req.body;
    if (!orderCode) {
      return res.status(400).json({ message: 'Order code is required.' });
    }

    const order = await prisma.order.findUnique({
      where: { orderCode: orderCode.toUpperCase() },
      include: { restaurant: { select: { id: true, name: true } } },
    });

    if (!order) {
      return res.status(404).json({ message: 'Invalid order code. Order not found.' });
    }

    if (req.user.role === 'RESTAURANT_MANAGER' && order.restaurantId !== req.user.restaurantId) {
      return res.status(403).json({ message: 'You can only confirm delivery for your restaurant.' });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({
        message: `Order must be COMPLETED before delivery. Current status: ${order.status}`,
      });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DELIVERED' },
      include: {
        customer: { select: { id: true, username: true } },
        restaurant: { select: { id: true, name: true } },
        items: { include: { menuItem: { select: { id: true, name: true } } } },
      },
    });

    const io = req.app.get('io');
    emitOrderUpdate(io, order.id, updated);

    const notification = await prisma.notification.create({
      data: {
        message: 'Your order has been delivered. Enjoy your meal!',
        type: 'DELIVERED',
        userId: order.customerId,
        orderId: order.id,
      },
    });
    emitNotification(io, order.customerId, notification);

    res.json({
      message: 'Delivery confirmed successfully!',
      order: updated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { confirmDelivery };