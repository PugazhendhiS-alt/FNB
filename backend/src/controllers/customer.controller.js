const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getDashboard(req, res) {
  try {
    const userId = req.user.id;

    const [
      user,
      activeOrder,
      recentOrders,
      orderHistory,
      userOrderItems,
      offers,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          foodCard: {
            select: {
              balance: true,
              cardNumber: true,
              isActive: true,
              transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
          },
        },
      }),
      prisma.order.findFirst({
        where: { customerId: userId, status: { in: ['PAID', 'PREPARING', 'READY', 'CONFIRMED'] } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, orderCode: true, status: true, totalAmount: true, createdAt: true,
          restaurant: { select: { id: true, name: true } },
          items: { select: { quantity: true, unitPrice: true, menuItem: { select: { id: true, name: true, price: true } } } },
        },
      }),
      prisma.order.findMany({
        where: { customerId: userId, status: { in: ['COMPLETED', 'DELIVERED'] } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true, orderCode: true, status: true, totalAmount: true, createdAt: true,
          restaurant: { select: { id: true, name: true } },
          items: { select: { quantity: true, unitPrice: true, menuItem: { select: { id: true, name: true } } } },
        },
      }),
      prisma.order.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, orderCode: true, status: true, totalAmount: true, createdAt: true,
          restaurant: { select: { id: true, name: true } },
          items: { select: { quantity: true, unitPrice: true, menuItem: { select: { id: true, name: true } } } },
        },
      }),
      prisma.orderItem.findMany({
        where: { order: { customerId: userId } },
        select: {
          quantity: true,
          menuItem: {
            select: {
              id: true, name: true, price: true, foodCategory: true, restaurantId: true,
              restaurant: { select: { id: true, name: true, cuisine: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.offer.findMany({
        where: { isActive: true },
        select: { id: true, title: true, description: true, code: true, discountPct: true, discountAmt: true, minOrderAmt: true, expiresAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, message: true, type: true, createdAt: true },
      }),
    ]);

    const itemFreq = {};
    const restaurantFreq = {};
    const restaurantIds = new Set();
    userOrderItems.forEach(oi => {
      const m = oi.menuItem;
      itemFreq[m.id] = itemFreq[m.id] || { count: 0, item: m };
      itemFreq[m.id].count += oi.quantity;
      restaurantFreq[m.restaurantId] = restaurantFreq[m.restaurantId] || { count: 0, restaurant: m.restaurant };
      restaurantFreq[m.restaurantId].count += 1;
      restaurantIds.add(m.restaurantId);
    });

    const favoriteItems = Object.values(itemFreq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(f => f.item);

    const favoriteRestaurants = Object.values(restaurantFreq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(f => f.restaurant);

    const rIds = [...restaurantIds];

    const trendingItems = rIds.length > 0
      ? await prisma.menuItem.findMany({
          where: { restaurantId: { in: rIds }, available: true },
          take: 6,
          orderBy: { updatedAt: 'desc' },
          select: { id: true, name: true, price: true, foodCategory: true, restaurantId: true, available: true },
        })
      : [];

    res.json({
      activeOrder,
      wallet: user?.foodCard ? {
        balance: user.foodCard.balance,
        cardNumber: user.foodCard.cardNumber,
        isActive: user.foodCard.isActive,
        recentTransactions: user.foodCard.transactions,
      } : null,
      recentOrders,
      recommendations: { favoriteItems, trendingItems },
      offers,
      favorites: { restaurants: favoriteRestaurants, items: favoriteItems },
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
    const [orderItems] = await Promise.all([
      prisma.orderItem.findMany({
        where: { order: { customerId: userId } },
        select: { quantity: true, menuItem: { select: { id: true, name: true, price: true, foodCategory: true, restaurantId: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const freq = {};
    orderItems.forEach(oi => {
      const m = oi.menuItem;
      freq[m.id] = freq[m.id] || { count: 0, item: m };
      freq[m.id].count += oi.quantity;
    });

    const favoriteItems = Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(f => f.item);

    const trendingItems = await prisma.menuItem.findMany({
      where: { available: true },
      take: 6,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, price: true, foodCategory: true, restaurantId: true },
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
      select: { id: true, title: true, description: true, code: true, discountPct: true, discountAmt: true, minOrderAmt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(offers);
  } catch (error) {
    console.error('Offers error:', error);
    res.status(500).json({ message: 'Failed to load offers' });
  }
}

module.exports = { getDashboard, getRecommendations, getOffers };
