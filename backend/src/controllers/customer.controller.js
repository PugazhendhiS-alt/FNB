const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getStatusSortWeight(status) {
  const order = ['PAID', 'PREPARING', 'READY', 'COMPLETED', 'DELIVERED', 'CONFIRMED'];
  const idx = order.indexOf(status);
  return idx >= 0 ? idx : 99;
}

async function getDashboard(req, res) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { foodCard: { include: { transactions: { orderBy: { createdAt: 'desc' }, take: 5 } } } },
    });

    const activeOrder = await prisma.order.findFirst({
      where: { customerId: userId, status: { in: ['PAID', 'PREPARING', 'READY', 'CONFIRMED'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
      },
    });

    const recentOrders = await prisma.order.findMany({
      where: { customerId: userId, status: { in: ['COMPLETED', 'DELIVERED'] } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
      },
    });

    const orderHistory = await prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
      },
    });

    const userOrderItems = await prisma.orderItem.findMany({
      where: { order: { customerId: userId } },
      include: { menuItem: { include: { restaurant: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const itemFrequency = {};
    const restaurantFrequency = {};
    userOrderItems.forEach(oi => {
      const mid = oi.menuItemId;
      itemFrequency[mid] = itemFrequency[mid] || { count: 0, item: oi.menuItem };
      itemFrequency[mid].count += oi.quantity;
      const rid = oi.menuItem.restaurantId;
      restaurantFrequency[rid] = restaurantFrequency[rid] || { count: 0, restaurant: oi.menuItem.restaurant };
      restaurantFrequency[rid].count += 1;
    });

    const favoriteItems = Object.values(itemFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(f => f.item);

    const favoriteRestaurants = Object.values(restaurantFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(f => f.restaurant);

    const restaurantIds = [...new Set(userOrderItems.map(oi => oi.menuItem.restaurantId))];

    const trendingItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: { in: restaurantIds.length > 0 ? restaurantIds : undefined },
        available: true,
      },
      take: 6,
      orderBy: { updatedAt: 'desc' },
    });

    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const unreadNotifications = await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      activeOrder,
      wallet: user?.foodCard ? {
        balance: user.foodCard.balance,
        cardNumber: user.foodCard.cardNumber,
        isActive: user.foodCard.isActive,
        recentTransactions: user.foodCard.transactions,
      } : null,
      recentOrders,
      recommendations: {
        favoriteItems,
        trendingItems,
      },
      offers,
      favorites: {
        restaurants: favoriteRestaurants,
        items: favoriteItems,
      },
      orderHistory,
      unreadNotifications,
    });
  } catch (error) {
    console.error('Customer dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
}

async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { buildingId: true },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { order: { customerId: userId } },
      include: { menuItem: true },
      orderBy: { createdAt: 'desc' },
    });

    const freq = {};
    orderItems.forEach(oi => {
      freq[oi.menuItemId] = freq[oi.menuItemId] || { count: 0, item: oi.menuItem };
      freq[oi.menuItemId].count += oi.quantity;
    });

    const favoriteItems = Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(f => f.item);

    const trendingItems = await prisma.menuItem.findMany({
      where: { available: true },
      take: 6,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ favoriteItems, trendingItems });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Failed to load recommendations' });
  }
}

async function getOffers(req, res) {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(offers);
  } catch (error) {
    console.error('Offers error:', error);
    res.status(500).json({ message: 'Failed to load offers' });
  }
}

module.exports = { getDashboard, getRecommendations, getOffers };
