const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AVAILABLE_WIDGETS = {
  stats_total_users:     { label: 'Total Users',     displayType: 'stat_card',  roles: ['SUPERADMIN','ADMIN'] },
  stats_buildings:       { label: 'Total Buildings',  displayType: 'stat_card',  roles: ['SUPERADMIN','ADMIN'] },
  stats_restaurants:     { label: 'Total Restaurants',displayType: 'stat_card',  roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  stats_orders:          { label: 'Total Orders',     displayType: 'stat_card',  roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  stats_revenue:         { label: 'Total Revenue',    displayType: 'stat_card',  roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER'] },
  stats_pending_orders:  { label: 'Pending Orders',   displayType: 'stat_card',  roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  stats_preparing:       { label: 'In Preparation',   displayType: 'stat_card',  roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  stats_completed_today: { label: 'Delivered Today',  displayType: 'stat_card',  roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  users_by_role:         { label: 'Users by Role',    displayType: 'progress',  roles: ['SUPERADMIN','ADMIN'] },
  orders_by_status:      { label: 'Orders by Status', displayType: 'status_bar',roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  recent_orders:         { label: 'Recent Orders',    displayType: 'list',      roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  popular_items:         { label: 'Popular Items',    displayType: 'ranked_list',roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  buildings_list:        { label: 'Buildings',        displayType: 'list',      roles: ['SUPERADMIN','ADMIN'] },
  restaurants_list:      { label: 'Restaurants',      displayType: 'list',      roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER'] },
  quick_actions:         { label: 'Quick Actions',    displayType: 'action_grid',roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  building_reports:      { label: 'Building Reports', displayType: 'table',     roles: ['SUPERADMIN','ADMIN'] },
  restaurant_reports:    { label: 'Restaurant Reports',displayType: 'table',    roles: ['SUPERADMIN','ADMIN'] },
  revenue_chart:         { label: 'Revenue Chart',    displayType: 'bar_chart', roles: ['SUPERADMIN','ADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER'] },
};

const CUSTOM_DATA_SOURCES = [
  { value: 'total_users',     label: 'Total Users' },
  { value: 'total_buildings', label: 'Total Buildings' },
  { value: 'total_restaurants', label: 'Total Restaurants' },
  { value: 'total_orders',    label: 'Total Orders' },
  { value: 'total_revenue',   label: 'Total Revenue' },
  { value: 'pending_orders',  label: 'Pending Orders' },
  { value: 'preparing_orders',label: 'In Preparation' },
  { value: 'completed_today', label: 'Delivered Today' },
  { value: 'avg_order_value', label: 'Average Order Value' },
];

function hasRole(role, allowed) {
  return allowed.includes(role);
}

const WIDGET_COLORS = ['blue', 'green', 'purple', 'yellow', 'red', 'indigo', 'teal'];

const GRID_COLS = 6;
const ROW_HEIGHT = 2;

// Predefined grid positions for a nice 6-column dashboard layout
const GRID_PRESETS = [
  // Row 0: stat cards across the top (6 cols: 4 stat cards at w=1, h=1, then 2 stat cards)
  { w: 1, h: 1, x: 0, y: 0 },
  { w: 1, h: 1, x: 1, y: 0 },
  { w: 1, h: 1, x: 2, y: 0 },
  { w: 1, h: 1, x: 3, y: 0 },
  { w: 1, h: 1, x: 4, y: 0 },
  { w: 1, h: 1, x: 5, y: 0 },
  // Row 1: 3 stat cards
  { w: 1, h: 1, x: 0, y: 1 },
  { w: 1, h: 1, x: 1, y: 1 },
  { w: 1, h: 1, x: 2, y: 1 },
  // Row 2-3: wide widgets (w:3, h:2)
  { w: 3, h: 2, x: 0, y: 2 },
  { w: 3, h: 2, x: 3, y: 2 },
  // Row 4-5: mixed
  { w: 2, h: 2, x: 0, y: 4 },
  { w: 2, h: 2, x: 2, y: 4 },
  { w: 2, h: 2, x: 4, y: 4 },
  // Row 6-7: wide table + side list
  { w: 4, h: 2, x: 0, y: 6 },
  { w: 2, h: 2, x: 4, y: 6 },
  // Row 8-9: remaining
  { w: 3, h: 2, x: 0, y: 8 },
  { w: 3, h: 2, x: 3, y: 8 },
];

function getLayoutForType(widgetType, displayType, index) {
  // Use presets when available, fall back to auto-positioning
  if (index < GRID_PRESETS.length) return { ...GRID_PRESETS[index] };

  // Auto-position for extras
  const base = { w: 1, h: 1 };
  if (displayType === 'stat_card') base.w = 1;
  else if (['table', 'bar_chart'].includes(displayType)) { base.w = 2; base.h = 2; }
  else { base.w = 1; base.h = 2; }

  base.x = (index * base.w) % GRID_COLS;
  base.y = Math.floor((index * base.w) / GRID_COLS) * Math.ceil(base.h / ROW_HEIGHT);
  return base;
}

async function seedDefaultWidgets(userId, role) {
  const entries = Object.entries(AVAILABLE_WIDGETS)
    .filter(([, def]) => hasRole(role, def.roles));

  if (entries.length === 0) return [];

  const data = entries.map(([widgetType, def], i) => {
    const layout = getLayoutForType(widgetType, def.displayType, i);
    return {
      userId,
      title: def.label,
      widgetType,
      displayType: def.displayType,
      config: JSON.stringify({ color: WIDGET_COLORS[i % WIDGET_COLORS.length] }),
      layout: JSON.stringify(layout),
      position: i,
      isVisible: true,
      isCustom: false,
    };
  });

  await prisma.userWidget.createMany({ data });
  return prisma.userWidget.findMany({ where: { userId }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
}

async function repairPositions(userId) {
  const widgets = await prisma.userWidget.findMany({
    where: { userId, isVisible: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });
  let changed = false;
  for (let i = 0; i < widgets.length; i++) {
    if (widgets[i].position !== i) {
      await prisma.userWidget.update({ where: { id: widgets[i].id }, data: { position: i } });
      changed = true;
    }
  }
  return changed;
}

async function getWidgets(req, res, next) {
  try {
    const currentRole = req.user.isSuperadmin ? 'SUPERADMIN' : req.user.role;
    const count = await prisma.userWidget.count({ where: { userId: req.user.id } });

    if (count === 0) {
      const seeded = await seedDefaultWidgets(req.user.id, currentRole);
      const parsed = seeded.map(w => ({
        ...w,
        config: JSON.parse(w.config || '{}'),
        layout: JSON.parse(w.layout || '{"w":1,"h":2}'),
      }));
      return res.json(parsed);
    }

    await repairPositions(req.user.id);

    const widgets = await prisma.userWidget.findMany({
      where: { userId: req.user.id, isVisible: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    const parsed = widgets
      .filter(w => {
        if (w.isCustom) return true;
        const def = AVAILABLE_WIDGETS[w.widgetType];
        if (!def) return false;
        return hasRole(currentRole, def.roles);
      })
      .map(w => ({
        ...w,
        config: JSON.parse(w.config || '{}'),
        layout: JSON.parse(w.layout || '{"w":1,"h":2}'),
      }));

    res.json(parsed);
  } catch (err) { next(err); }
}

async function addWidget(req, res, next) {
  try {
    const { widgetType, title, color } = req.body;
    const def = AVAILABLE_WIDGETS[widgetType];
    if (!def) return res.status(400).json({ message: 'Invalid widget type' });
    if (!hasRole(req.user.role, def.roles) && !req.user.isSuperadmin) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const count = await prisma.userWidget.count({ where: { userId: req.user.id } });
    const widget = await prisma.userWidget.create({
      data: {
        userId: req.user.id,
        title: title || def.label,
        widgetType,
        displayType: def.displayType,
        config: JSON.stringify({ color: color || 'blue' }),
        layout: JSON.stringify(getLayoutForType(widgetType, def.displayType, count)),
        position: count,
      },
    });
    res.status(201).json({ ...widget, config: JSON.parse(widget.config), layout: JSON.parse(widget.layout) });
  } catch (err) { next(err); }
}

async function updateWidget(req, res, next) {
  try {
    const { id } = req.params;
    const { title, config, layout, position, isVisible } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (config !== undefined) data.config = JSON.stringify(config);
    if (layout !== undefined) data.layout = JSON.stringify(layout);
    if (position !== undefined) data.position = position;
    if (isVisible !== undefined) data.isVisible = isVisible;

    const widget = await prisma.userWidget.update({
      where: { id },
      data,
    });
    res.json({ ...widget, config: JSON.parse(widget.config), layout: JSON.parse(widget.layout) });
  } catch (err) { next(err); }
}

async function deleteWidget(req, res, next) {
  try {
    await prisma.userWidget.delete({ where: { id: req.params.id } });
    res.json({ message: 'Widget removed' });
  } catch (err) { next(err); }
}

async function createCustomWidget(req, res, next) {
  try {
    const { title, displayType, customSource, config } = req.body;
    if (!title || !displayType || !customSource) {
      return res.status(400).json({ message: 'title, displayType, and customSource required' });
    }
    if (!CUSTOM_DATA_SOURCES.find(s => s.value === customSource)) {
      return res.status(400).json({ message: 'Invalid custom data source' });
    }

    const count = await prisma.userWidget.count({ where: { userId: req.user.id } });
    const widget = await prisma.userWidget.create({
      data: {
        userId: req.user.id,
        title,
        widgetType: 'custom',
        displayType: displayType || 'stat_card',
        config: JSON.stringify(config || { color: 'blue' }),
        layout: JSON.stringify(getLayoutForType('custom', displayType || 'stat_card', count)),
        position: count,
        isCustom: true,
        customSource,
      },
    });
    res.status(201).json({ ...widget, config: JSON.parse(widget.config), layout: JSON.parse(widget.layout) });
  } catch (err) { next(err); }
}

async function updateCustomWidget(req, res, next) {
  try {
    const { id } = req.params;
    const { title, displayType, customSource, config } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (displayType !== undefined) data.displayType = displayType;
    if (customSource !== undefined) data.customSource = customSource;
    if (config !== undefined) data.config = JSON.stringify(config);

    const widget = await prisma.userWidget.update({ where: { id }, data });
    res.json({ ...widget, config: JSON.parse(widget.config), layout: JSON.parse(widget.layout) });
  } catch (err) { next(err); }
}

async function getAvailableWidgets(req, res, next) {
  try {
    const role = req.user.role;
    const entries = Object.entries(AVAILABLE_WIDGETS)
      .filter(([, def]) => hasRole(role, def.roles) || req.user.isSuperadmin)
      .map(([type, def]) => ({ widgetType: type, ...def }));

    const existing = await prisma.userWidget.findMany({
      where: { userId: req.user.id },
      select: { widgetType: true },
    });
    const existingTypes = new Set(existing.map(w => w.widgetType));

    res.json({
      systemWidgets: entries.filter(e => !existingTypes.has(e.widgetType)),
      customSources: CUSTOM_DATA_SOURCES,
    });
  } catch (err) { next(err); }
}

async function getWidgetData(req, res, next) {
  try {
    const role = req.user.role;
    const isSuper = req.user.isSuperadmin;
    let where = {};
    let restaurantWhere = {};

    if (!isSuper) {
      if (role === 'BUILDING_MANAGER' && req.user.buildingId) {
        restaurantWhere.buildingId = req.user.buildingId;
        const restaurantIds = await prisma.restaurant.findMany({
          where: restaurantWhere, select: { id: true },
        });
        where.restaurantId = { in: restaurantIds.map(r => r.id) };
      } else if ((role === 'RESTAURANT_MANAGER' || role === 'CHEF') && req.user.restaurantId) {
        where.restaurantId = req.user.restaurantId;
      }
    }
    if (role === 'CHEF') {
      where.status = { in: ['PAID', 'PREPARING'] };
    }

    const stats = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({ where: { ...where, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      prisma.order.count({ where: { ...where, status: { in: ['PAID', 'PENDING_PAYMENT'] } } }),
      prisma.order.count({ where: { ...where, status: 'PREPARING' } }),
      prisma.order.count({
        where: { ...where, status: 'DELIVERED', updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
      }),
    ]);

    const data = {
      total_users: await prisma.user.count(),
      total_buildings: await prisma.building.count(),
      total_restaurants: await prisma.restaurant.count({ where: restaurantWhere }),
      total_orders: stats[0],
      total_revenue: stats[1]._sum.totalAmount || 0,
      pending_orders: stats[2],
      preparing_orders: stats[3],
      completed_today: stats[4],
      avg_order_value: stats[0] > 0 ? ((stats[1]._sum.totalAmount || 0) / stats[0]) : 0,
    };

    const fullOverview = isSuper ? await buildSuperAdminOverview() : null;

    res.json({ data, fullOverview });
  } catch (err) { next(err); }
}

async function batchWidgetData(req, res, next) {
  try {
    const { widgetIds } = req.body;
    if (!widgetIds || !Array.isArray(widgetIds)) {
      return res.status(400).json({ message: 'widgetIds array required' });
    }

    const widgets = await prisma.userWidget.findMany({
      where: { id: { in: widgetIds }, userId: req.user.id },
    });

    const role = req.user.role;
    const isSuper = req.user.isSuperadmin;
    let where = {};
    let restaurantWhere = {};

    if (!isSuper) {
      if (role === 'BUILDING_MANAGER' && req.user.buildingId) {
        restaurantWhere.buildingId = req.user.buildingId;
        const restaurantIds = await prisma.restaurant.findMany({
          where: restaurantWhere, select: { id: true },
        });
        where.restaurantId = { in: restaurantIds.map(r => r.id) };
      } else if ((role === 'RESTAURANT_MANAGER' || role === 'CHEF') && req.user.restaurantId) {
        where.restaurantId = req.user.restaurantId;
      }
    }

    let superOverview = null;
    let reports = null;

    const needsFullOverview = widgets.some(w => ['buildings_list','restaurants_list','users_by_role','quick_actions','building_reports','restaurant_reports'].includes(w.widgetType));
    const needsReports = widgets.some(w => ['building_reports','restaurant_reports'].includes(w.widgetType));

    if (isSuper && needsFullOverview) {
      superOverview = await buildSuperAdminOverview();
    }
    if (isSuper && needsReports) {
      const reportsData = await buildReports();
      if (needsReports) reports = reportsData;
    }

    const results = {};
    for (const w of widgets) {
      results[w.id] = await resolveWidgetData(w, where, restaurantWhere, superOverview, reports, isSuper);
    }
    res.json(results);
  } catch (err) { next(err); }
}

function computeTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function getPeriodCount(where, daysAgo) {
  const start = new Date(); start.setDate(start.getDate() - daysAgo);
  const end = new Date(); end.setDate(end.getDate() - Math.floor(daysAgo / 2));
  return prisma.order.count({ where: { ...where, createdAt: { gte: start, lt: end } } });
}

async function resolveWidgetData(widget, where, restaurantWhere, superOverview, reports, isSuper) {
  const type = widget.widgetType;
  const isCustom = widget.isCustom;

  if (isCustom) {
    return await resolveCustomData(widget.customSource, where, restaurantWhere);
  }

  const now = new Date();
  const daysAgo = 14;
  const midPoint = new Date(); midPoint.setDate(midPoint.getDate() - Math.floor(daysAgo / 2));

  switch (type) {
    case 'stats_total_users':
      return isSuper ? { value: superOverview?.totalUsers || 0, trend: 0 } : null;
    case 'stats_buildings':
      return isSuper ? { value: superOverview?.totalBuildings || 0, trend: 0 } : null;
    case 'stats_restaurants':
      return { value: await prisma.restaurant.count({ where: restaurantWhere }), trend: 0 };
    case 'stats_orders': {
      const [current, previous] = await Promise.all([
        prisma.order.count({ where: { ...where, createdAt: { gte: midPoint } } }),
        prisma.order.count({ where: { ...where, createdAt: { gte: new Date(Date.now() - daysAgo * 86400000), lt: midPoint } } }),
      ]);
      return { value: await prisma.order.count({ where }), trend: computeTrend(current, previous) };
    }
    case 'stats_revenue': {
      const [rev, curRev, prevRev] = await Promise.all([
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED', createdAt: { gte: midPoint } }, _sum: { totalAmount: true } }),
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED', createdAt: { gte: new Date(Date.now() - daysAgo * 86400000), lt: midPoint } }, _sum: { totalAmount: true } }),
      ]);
      return { value: rev._sum.totalAmount || 0, trend: computeTrend(curRev._sum.totalAmount || 0, prevRev._sum.totalAmount || 0) };
    }
    case 'stats_pending_orders':
      return { value: await prisma.order.count({ where: { ...where, status: { in: ['PAID','PENDING_PAYMENT'] } } }), trend: 0 };
    case 'stats_preparing':
      return { value: await prisma.order.count({ where: { ...where, status: 'PREPARING' } }), trend: 0 };
    case 'stats_completed_today':
      return { value: await prisma.order.count({ where: { ...where, status: 'DELIVERED', updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }), trend: 0 };
    case 'users_by_role':
      return isSuper ? { data: superOverview?.userRoleDistribution || [] } : { data: [] };
    case 'orders_by_status': {
      const orders = await prisma.order.findMany({ where, take: 100, select: { status: true } });
      return { data: orders };
    }
    case 'recent_orders': {
      const orders = await prisma.order.findMany({
        where, orderBy: { createdAt: 'desc' }, take: 10,
        include: { customer: { select: { username: true } }, restaurant: { select: { name: true } }, items: { include: { menuItem: { select: { name: true } } } } },
      });
      return { data: orders };
    }
    case 'popular_items': {
      const items = await prisma.orderItem.groupBy({
        by: ['menuItemId'], where: { order: { ...where, status: 'DELIVERED' } },
        _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5,
      });
      const details = await Promise.all(items.map(async item => {
        const mi = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
        return { ...mi, totalSold: item._sum.quantity || 0 };
      }));
      return { data: details };
    }
    case 'buildings_list':
      return isSuper ? { data: superOverview?.buildings || [] } : { data: [] };
    case 'restaurants_list':
      return isSuper ? { data: superOverview?.restaurants || [] } : { data: [] };
    case 'quick_actions':
      return { data: true };
    case 'building_reports':
      return isSuper ? { data: reports?.buildings || [] } : { data: [] };
    case 'restaurant_reports':
      return isSuper ? { data: reports?.restaurants || [] } : { data: [] };
    case 'revenue_chart': {
      const days = 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const orders = await prisma.order.findMany({
        where: { status: 'DELIVERED', updatedAt: { gte: startDate } },
        select: { totalAmount: true, updatedAt: true },
        orderBy: { updatedAt: 'asc' },
      });
      const dailyData = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate); d.setDate(d.getDate() + i);
        dailyData[d.toISOString().split('T')[0]] = { date: d.toISOString().split('T')[0], revenue: 0, orders: 0 };
      }
      orders.forEach(o => {
        const key = o.updatedAt.toISOString().split('T')[0];
        if (dailyData[key]) { dailyData[key].revenue += o.totalAmount; dailyData[key].orders += 1; }
      });
      return { data: Object.values(dailyData) };
    }
    default:
      return null;
  }
}

async function resolveCustomData(source, where, restaurantWhere) {
  const now = new Date();
  const daysAgo = 14;
  const midPoint = new Date(); midPoint.setDate(midPoint.getDate() - Math.floor(daysAgo / 2));
  const prevStart = new Date(Date.now() - daysAgo * 86400000);

  switch (source) {
    case 'total_users':
      return { value: await prisma.user.count(), trend: 0 };
    case 'total_buildings':
      return { value: await prisma.building.count(), trend: 0 };
    case 'total_restaurants':
      return { value: await prisma.restaurant.count({ where: restaurantWhere }), trend: 0 };
    case 'total_orders': {
      const [cur, prev] = await Promise.all([
        prisma.order.count({ where: { ...where, createdAt: { gte: midPoint } } }),
        prisma.order.count({ where: { ...where, createdAt: { gte: prevStart, lt: midPoint } } }),
      ]);
      return { value: await prisma.order.count({ where }), trend: computeTrend(cur, prev) };
    }
    case 'total_revenue': {
      const [rev, curRev, prevRev] = await Promise.all([
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED', createdAt: { gte: midPoint } }, _sum: { totalAmount: true } }),
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED', createdAt: { gte: prevStart, lt: midPoint } }, _sum: { totalAmount: true } }),
      ]);
      return { value: rev._sum.totalAmount || 0, trend: computeTrend(curRev._sum.totalAmount || 0, prevRev._sum.totalAmount || 0) };
    }
    case 'pending_orders':
      return { value: await prisma.order.count({ where: { ...where, status: { in: ['PAID','PENDING_PAYMENT'] } } }), trend: 0 };
    case 'preparing_orders':
      return { value: await prisma.order.count({ where: { ...where, status: 'PREPARING' } }), trend: 0 };
    case 'completed_today':
      return { value: await prisma.order.count({ where: { ...where, status: 'DELIVERED', updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }), trend: 0 };
    case 'avg_order_value': {
      const [count, rev, curCount, curRev, prevCount, prevRev] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
        prisma.order.count({ where: { ...where, createdAt: { gte: midPoint } } }),
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED', createdAt: { gte: midPoint } }, _sum: { totalAmount: true } }),
        prisma.order.count({ where: { ...where, createdAt: { gte: prevStart, lt: midPoint } } }),
        prisma.order.aggregate({ where: { ...where, status: 'DELIVERED', createdAt: { gte: prevStart, lt: midPoint } }, _sum: { totalAmount: true } }),
      ]);
      const curAvg = curCount > 0 ? (curRev._sum.totalAmount || 0) / curCount : 0;
      const prevAvg = prevCount > 0 ? (prevRev._sum.totalAmount || 0) / prevCount : 0;
      return { value: count > 0 ? ((rev._sum.totalAmount || 0) / count) : 0, trend: computeTrend(curAvg, prevAvg) };
    }
    default:
      return { value: 0, trend: 0 };
  }
}

async function buildSuperAdminOverview() {
  const [totalUsers, userRoleDistribution, totalBuildings, totalRestaurants, activeBuildings, activeRestaurants,
    totalOrders, totalRevenue, pendingOrders, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    prisma.building.count(),
    prisma.restaurant.count(),
    prisma.building.count({ where: { isActive: true } }),
    prisma.restaurant.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { status: { in: ['PAID','PENDING_PAYMENT'] } } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { restaurant: { select: { name: true } } } }),
  ]);

  const buildingsList = await prisma.building.findMany({ include: { _count: { select: { restaurants: true, users: true } } } });
  const restaurantsList = await prisma.restaurant.findMany({ include: { building: { select: { name: true } }, _count: { select: { menuItems: true, orders: true } } } });

  return {
    totalUsers, totalBuildings, totalRestaurants, activeBuildings, activeRestaurants,
    totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0, pendingOrders,
    userRoleDistribution: userRoleDistribution.map(g => ({ role: g.role, count: g._count.id })),
    buildings: buildingsList, restaurants: restaurantsList, recentOrders,
  };
}

async function buildReports() {
  const buildings = await prisma.building.findMany({
    include: {
      _count: { select: { restaurants: true, users: true } },
      restaurants: { include: { orders: { select: { totalAmount: true, status: true } } } },
    },
  });
  const buildingReports = buildings.map(b => {
    const allOrders = b.restaurants.flatMap(r => r.orders);
    const totalRevenue = allOrders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.totalAmount, 0);
    return { id: b.id, name: b.name, address: b.address, totalRestaurants: b._count.restaurants, totalUsers: b._count.users, totalOrders: allOrders.length, totalRevenue };
  });

  const restaurants = await prisma.restaurant.findMany({
    include: { building: { select: { name: true } }, orders: { select: { totalAmount: true, status: true } } },
  });
  const restaurantReports = restaurants.map(r => ({
    id: r.id, name: r.name, cuisine: r.cuisine, buildingName: r.building.name,
    totalOrders: r.orders.length,
    totalRevenue: r.orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.totalAmount, 0),
  }));

  return { buildings: buildingReports, restaurants: restaurantReports };
}

module.exports = { getWidgets, addWidget, updateWidget, deleteWidget, createCustomWidget, updateCustomWidget, getAvailableWidgets, getWidgetData, batchWidgetData };
