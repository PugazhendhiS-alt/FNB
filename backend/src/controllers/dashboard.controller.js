const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getStats(req, res, next) {
  try {
    const role = req.user.role;
    const isSuper = req.user.isSuperadmin;
    let where = {};
    let restaurantWhere = {};

    if (!isSuper) {
      if (role === 'BUILDING_MANAGER' && req.user.buildingId) {
        restaurantWhere.buildingId = req.user.buildingId;
        const restaurantIds = await prisma.restaurant.findMany({
          where: restaurantWhere,
          select: { id: true },
        });
        where.restaurantId = { in: restaurantIds.map(r => r.id) };
      } else if (role === 'RESTAURANT_MANAGER' && req.user.restaurantId) {
        where.restaurantId = req.user.restaurantId;
      } else if (role === 'CHEF' && req.user.restaurantId) {
        where.restaurantId = req.user.restaurantId;
      }
    }

    const today = new Date(new Date().setHours(0, 0, 0, 0));

    const [
      totalOrders,
      revenueAgg,
      totalCustomers,
      totalRestaurants,
      pendingOrders,
      preparingOrders,
      completedToday,
      recentOrders,
      popularItems,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({ where: { ...where, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.restaurant.count({ where: restaurantWhere }),
      prisma.order.count({ where: { ...where, status: { in: ['PAID', 'PENDING_PAYMENT'] } } }),
      prisma.order.count({ where: { ...where, status: 'PREPARING' } }),
      prisma.order.count({ where: { ...where, status: 'DELIVERED', updatedAt: { gte: today } } }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, orderCode: true, status: true, totalAmount: true, createdAt: true,
          customer: { select: { username: true } },
          restaurant: { select: { name: true } },
          items: { select: { menuItem: { select: { name: true } } } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: { order: { ...where, status: 'DELIVERED' } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const menuItemIds = popularItems.map(item => item.menuItemId);
    const menuItems = menuItemIds.length > 0
      ? await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } }, select: { id: true, name: true, price: true } })
      : [];
    const menuItemMap = Object.fromEntries(menuItems.map(m => [m.id, m]));

    const popularItemDetails = popularItems.map(item => {
      const menuItem = menuItemMap[item.menuItemId];
      return { ...menuItem, totalSold: item._sum.quantity || 0 };
    });

    res.json({
      totalOrders,
      totalRevenue: revenueAgg._sum.totalAmount || 0,
      totalCustomers,
      totalRestaurants,
      totalBuildings: isSuper ? await prisma.building.count() : 0,
      pendingOrders,
      preparingOrders,
      completedToday,
      recentOrders,
      popularItems: popularItemDetails,
    });
  } catch (err) {
    next(err);
  }
}

async function getRevenueChart(req, res, next) {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: { status: 'DELIVERED', updatedAt: { gte: startDate } },
      select: { totalAmount: true, updatedAt: true },
      orderBy: { updatedAt: 'asc' },
    });

    const dailyData = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      dailyData[key] = { date: key, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
      const key = order.updatedAt.toISOString().split('T')[0];
      if (dailyData[key]) {
        dailyData[key].revenue += order.totalAmount;
        dailyData[key].orders += 1;
      }
    });

    res.json(Object.values(dailyData));
  } catch (err) {
    next(err);
  }
}

async function getOrderStatusDistribution(req, res, next) {
  try {
    const groups = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    res.json(groups.map(g => ({ status: g.status, count: g._count.id })));
  } catch (err) {
    next(err);
  }
}

async function getSuperAdminOverview(req, res, next) {
  try {
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    const [
      totalUsers,
      userRoleDistribution,
      totalBuildings,
      totalRestaurants,
      activeBuildings,
      activeRestaurants,
      totalOrders,
      revenueAgg,
      pendingOrders,
      preparingOrders,
      completedToday,
      recentOrders,
      popularItems,
      buildingsList,
      restaurantsList,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.building.count(),
      prisma.restaurant.count(),
      prisma.building.count({ where: { isActive: true } }),
      prisma.restaurant.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      prisma.order.count({ where: { status: { in: ['PAID', 'PENDING_PAYMENT'] } } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'DELIVERED', updatedAt: { gte: today } } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, orderCode: true, status: true, totalAmount: true, createdAt: true,
          customer: { select: { username: true } },
          restaurant: { select: { name: true } },
          items: { select: { menuItem: { select: { name: true } } } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: { order: { status: 'DELIVERED' } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      prisma.building.findMany({
        select: {
          id: true, name: true, isActive: true,
          _count: { select: { restaurants: true, users: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.restaurant.findMany({
        select: {
          id: true, name: true, cuisine: true, isActive: true,
          building: { select: { name: true } },
          _count: { select: { menuItems: true, orders: true, users: true } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    const menuItemIds = popularItems.map(item => item.menuItemId);
    const menuItems = menuItemIds.length > 0
      ? await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } }, select: { id: true, name: true, price: true } })
      : [];
    const menuItemMap = Object.fromEntries(menuItems.map(m => [m.id, m]));

    const popularItemDetails = popularItems.map(item => {
      const menuItem = menuItemMap[item.menuItemId];
      return { ...menuItem, totalSold: item._sum.quantity || 0 };
    });

    res.json({
      totalUsers,
      userRoleDistribution,
      totalBuildings,
      totalRestaurants,
      activeBuildings,
      activeRestaurants,
      totalOrders,
      totalRevenue: revenueAgg._sum.totalAmount || 0,
      pendingOrders,
      preparingOrders,
      completedToday,
      recentOrders,
      popularItems: popularItemDetails,
      buildings: buildingsList,
      restaurants: restaurantsList,
    });
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const [buildings, restaurants] = await Promise.all([
      prisma.building.findMany({
        select: {
          id: true, name: true, address: true,
          _count: { select: { restaurants: true, users: true } },
          restaurants: {
            select: { orders: { select: { totalAmount: true, status: true, createdAt: true } } },
          },
        },
      }),
      prisma.restaurant.findMany({
        select: {
          id: true, name: true, cuisine: true,
          building: { select: { name: true } },
          orders: { select: { totalAmount: true, status: true, createdAt: true } },
          _count: { select: { orders: true } },
        },
      }),
    ]);

    const buildingReports = buildings.map(b => {
      const allOrders = b.restaurants.flatMap(r => r.orders);
      const totalRevenue = allOrders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: b.id,
        name: b.name,
        address: b.address,
        totalRestaurants: b._count.restaurants,
        totalUsers: b._count.users,
        totalOrders: allOrders.length,
        totalRevenue,
      };
    });

    const restaurantReports = restaurants.map(r => {
      const totalRevenue = r.orders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        buildingName: r.building.name,
        totalOrders: r.orders.length,
        totalRevenue,
      };
    });

    res.json({ buildings: buildingReports, restaurants: restaurantReports });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getRevenueChart, getOrderStatusDistribution, getSuperAdminOverview, getReports };