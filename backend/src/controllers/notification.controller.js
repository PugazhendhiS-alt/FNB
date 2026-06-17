const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getUnreadCount, markRead, markAllRead };
