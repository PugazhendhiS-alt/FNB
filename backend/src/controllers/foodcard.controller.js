const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { emitOrderUpdate } = require('../socket');

const prisma = new PrismaClient();

function generateCardNumber() {
  const digits = '0123456789';
  let num = '';
  for (let i = 0; i < 16; i++) {
    num += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return num;
}

async function createCard(req, res, next) {
  try {
    const { pin } = req.body;
    if (!pin || pin.length < 4 || pin.length > 6) {
      return res.status(400).json({ message: 'PIN must be 4-6 digits.' });
    }

    const existing = await prisma.foodCard.findUnique({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(400).json({ message: 'You already have a Food Card.' });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    let cardNumber;
    let cardNumberUnique = false;

    while (!cardNumberUnique) {
      cardNumber = generateCardNumber();
      const dup = await prisma.foodCard.findUnique({ where: { cardNumber } });
      if (!dup) cardNumberUnique = true;
    }

    const card = await prisma.foodCard.create({
      data: {
        userId: req.user.id,
        cardNumber,
        pin: hashedPin,
        balance: 0,
        isActive: true,
      },
    });

    res.status(201).json({ id: card.id, cardNumber: card.cardNumber, balance: card.balance, isActive: card.isActive });
  } catch (err) {
    next(err);
  }
}

async function getCard(req, res, next) {
  try {
    const card = await prisma.foodCard.findUnique({
      where: { userId: req.user.id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });

    if (!card) return res.status(404).json({ message: 'No Food Card found. Create one first.' });

    res.json({
      id: card.id,
      cardNumber: card.cardNumber,
      balance: card.balance,
      isActive: card.isActive,
      createdAt: card.createdAt,
      transactions: card.transactions,
    });
  } catch (err) {
    next(err);
  }
}

async function topUp(req, res, next) {
  try {
    const { amount, pin } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid top-up amount.' });
    }
    if (!pin) {
      return res.status(400).json({ message: 'PIN is required.' });
    }

    const card = await prisma.foodCard.findUnique({ where: { userId: req.user.id } });
    if (!card) return res.status(404).json({ message: 'No Food Card found.' });
    if (!card.isActive) return res.status(400).json({ message: 'Food Card is deactivated.' });

    const pinValid = await bcrypt.compare(pin, card.pin);
    if (!pinValid) return res.status(401).json({ message: 'Invalid PIN.' });

    const [updated] = await prisma.$transaction([
      prisma.foodCard.update({
        where: { id: card.id },
        data: { balance: { increment: amount } },
      }),
      prisma.foodCardTransaction.create({
        data: {
          foodCardId: card.id,
          type: 'TOPUP',
          amount,
          balanceBefore: card.balance,
          balanceAfter: card.balance + amount,
          description: 'Card top-up',
        },
      }),
    ]);

    res.json({ balance: updated.balance, message: `Successfully topped up ${amount.toFixed(2)}` });
  } catch (err) {
    next(err);
  }
}

async function payWithCard(req, res, next) {
  try {
    const { orderId, pin } = req.body;

    if (!orderId || !pin) {
      return res.status(400).json({ message: 'Order ID and PIN are required.' });
    }

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
    if (order.customerId !== req.user.id) {
      return res.status(403).json({ message: 'This order does not belong to you.' });
    }

    const card = await prisma.foodCard.findUnique({ where: { userId: req.user.id } });
    if (!card) return res.status(404).json({ message: 'No Food Card found.' });
    if (!card.isActive) return res.status(400).json({ message: 'Food Card is deactivated.' });

    const pinValid = await bcrypt.compare(pin, card.pin);
    if (!pinValid) return res.status(401).json({ message: 'Invalid PIN.' });

    if (card.balance < order.totalAmount) {
      return res.status(400).json({
        message: 'Insufficient balance.',
        balance: card.balance,
        required: order.totalAmount,
      });
    }

    const newBalance = card.balance - order.totalAmount;

    const [updatedCard, updatedOrder] = await prisma.$transaction([
      prisma.foodCard.update({
        where: { id: card.id },
        data: { balance: { decrement: order.totalAmount } },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'SUCCESS',
          paymentMethod: 'FOOD_CARD',
          transactionRef: `FC${Date.now()}`,
        },
        include: {
          customer: { select: { id: true, username: true } },
          restaurant: { select: { id: true, name: true } },
          items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        },
      }),
      prisma.foodCardTransaction.create({
        data: {
          foodCardId: card.id,
          type: 'PAYMENT',
          amount: order.totalAmount,
          balanceBefore: card.balance,
          balanceAfter: newBalance,
          description: `Payment for order ${order.orderCode}`,
          orderId: order.id,
        },
      }),
    ]);

    const notification = await prisma.notification.create({
      data: {
        message: 'Payment successful via Food Card! Your order has been placed.',
        type: 'PAYMENT_SUCCESS',
        userId: order.customerId,
        orderId: order.id,
      },
    });

    emitOrderUpdate(req.app.get('io'), orderId, { ...updatedOrder, notification });

    res.json({
      success: true,
      order: updatedOrder,
      balance: updatedCard.balance,
      message: 'Payment successful using Food Card!',
    });
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    const card = await prisma.foodCard.findUnique({ where: { userId: req.user.id } });
    if (!card) return res.status(404).json({ message: 'No Food Card found.' });

    const transactions = await prisma.foodCardTransaction.findMany({
      where: { foodCardId: card.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

async function changePin(req, res, next) {
  try {
    const { currentPin, newPin } = req.body;

    if (!newPin || newPin.length < 4 || newPin.length > 6) {
      return res.status(400).json({ message: 'New PIN must be 4-6 digits.' });
    }

    const card = await prisma.foodCard.findUnique({ where: { userId: req.user.id } });
    if (!card) return res.status(404).json({ message: 'No Food Card found.' });

    const pinValid = await bcrypt.compare(currentPin, card.pin);
    if (!pinValid) return res.status(401).json({ message: 'Current PIN is incorrect.' });

    const hashedPin = await bcrypt.hash(newPin, 10);
    await prisma.foodCard.update({
      where: { id: card.id },
      data: { pin: hashedPin },
    });

    res.json({ message: 'PIN changed successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createCard, getCard, topUp, payWithCard, getTransactions, changePin };
