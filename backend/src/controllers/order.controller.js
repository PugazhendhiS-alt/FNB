const { PrismaClient } = require('@prisma/client');
const { generateOrderCode, generateQRData, calculateTotal } = require('../utils/helpers');
const { emitOrderUpdate, emitNotification } = require('../socket');

const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const { status, restaurantId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (restaurantId) where.restaurantId = restaurantId;

    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (req.user.role === 'RESTAURANT_MANAGER' && req.user.restaurantId) {
      where.restaurantId = req.user.restaurantId;
    } else if (req.user.role === 'CHEF' && req.user.restaurantId) {
      where.restaurantId = req.user.restaurantId;
      where.status = { in: ['PAID', 'PREPARING', 'COMPLETED'] };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, username: true } },
        restaurant: { select: { id: true, name: true } },
        items: {
          include: { menuItem: { select: { id: true, name: true, price: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { id: true, username: true } },
        restaurant: { select: { id: true, name: true } },
        items: {
          include: { menuItem: { select: { id: true, name: true, price: true } } },
        },
      },
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function createGuest(req, res, next) {
  try {
    const { restaurantId, items, guestName, guestEmail, guestPhone } = req.body;
    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Restaurant and items are required.' });
    }

    const guestUser = await prisma.user.create({
      data: {
        username: `guest_${Date.now()}`,
        email: guestEmail || `guest_${Date.now()}@pos.local`,
        password: '',
        role: 'CUSTOMER',
        phone: guestPhone || null,
        isSuperadmin: false,
      },
    });

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(i => i.menuItemId) }, restaurantId },
    });

    if (menuItems.length !== items.length) {
      await prisma.user.delete({ where: { id: guestUser.id } });
      return res.status(400).json({ message: 'Some menu items not found or not in this restaurant.' });
    }

    const orderItems = items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice: menuItem.price };
    });

    const totalAmount = calculateTotal(orderItems);
    const orderCode = generateOrderCode();

    const order = await prisma.order.create({
      data: {
        orderCode,
        status: 'PENDING_PAYMENT',
        totalAmount,
        customerId: guestUser.id,
        restaurantId,
        items: { create: orderItems },
      },
      include: {
        restaurant: { select: { id: true, name: true } },
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
      },
    });

    emitOrderUpdate(req.app.get('io'), order.id, order);

    res.status(201).json({ order, guestToken: guestUser.id });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { restaurantId, items } = req.body;
    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Restaurant and items are required.' });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(i => i.menuItemId) }, restaurantId },
    });

    if (menuItems.length !== items.length) {
      return res.status(400).json({ message: 'Some menu items not found or not in this restaurant.' });
    }

    const orderItems = items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
      };
    });

    const totalAmount = calculateTotal(orderItems);
    const orderCode = generateOrderCode();

    const order = await prisma.order.create({
      data: {
        orderCode,
        status: 'PENDING_PAYMENT',
        totalAmount,
        customerId: req.user.id,
        restaurantId,
        items: { create: orderItems },
      },
      include: {
        customer: { select: { id: true, username: true } },
        restaurant: { select: { id: true, name: true } },
        items: {
          include: { menuItem: { select: { id: true, name: true, price: true } } },
        },
      },
    });

    emitOrderUpdate(req.app.get('io'), order.id, order);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validTransitions = {
      PENDING_PAYMENT: ['PAID', 'CANCELLED'],
      PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
      PAID: ['PREPARING', 'CANCELLED'],
      PREPARING: ['COMPLETED', 'CANCELLED'],
      COMPLETED: ['DELIVERED', 'CANCELLED'],
    };

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${order.status} to ${status}.`,
        allowedTransitions: validTransitions[order.status],
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: { select: { id: true, username: true } },
        restaurant: { select: { id: true, name: true } },
        items: { include: { menuItem: { select: { id: true, name: true } } } },
      },
    });

    const io = req.app.get('io');
    emitOrderUpdate(io, id, updated);

    if (status === 'PREPARING' || status === 'COMPLETED' || status === 'DELIVERED') {
      const notificationMessages = {
        PREPARING: 'Your order is being prepared!',
        COMPLETED: 'Your order is ready!',
        DELIVERED: 'Your order has been delivered. Enjoy!',
      };

      const notification = await prisma.notification.create({
        data: {
          message: notificationMessages[status] || `Order status updated to ${status}`,
          type: 'ORDER_UPDATE',
          userId: order.customerId,
          orderId: id,
        },
      });

      emitNotification(io, order.customerId, notification);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function getByCode(req, res, next) {
  try {
    const { code } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderCode: code },
      include: {
        customer: { select: { id: true, username: true } },
        restaurant: { select: { id: true, name: true } },
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
      },
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, createGuest, updateStatus, getByCode };