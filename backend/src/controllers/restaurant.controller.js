const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.query.buildingId) {
      where.buildingId = req.query.buildingId;
    } else if (req.user.role === 'BUILDING_MANAGER' && req.user.buildingId) {
      where.buildingId = req.user.buildingId;
    }
    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { menuItems: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
}

async function getAllPublic(req, res, next) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, description: true, cuisine: true, phone: true, image: true,
        building: { select: { name: true } },
        _count: { select: { menuItems: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'BUILDING_MANAGER' && req.user.buildingId) {
      where.buildingId = req.user.buildingId;
    }
    const restaurant = await prisma.restaurant.findFirst({
      where,
      include: {
        building: { select: { id: true, name: true } },
        menuItems: { where: { available: true }, orderBy: { category: 'asc' } },
        _count: { select: { menuItems: true, orders: true } },
      },
    });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
}

async function getByIdPublic(req, res, next) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, description: true, cuisine: true, phone: true, image: true,
        building: { select: { name: true } },
        menuItems: { where: { available: true }, orderBy: [{ category: 'asc' }, { name: 'asc' }] },
      },
    });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
}

async function getQrCode(req, res, next) {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id }, select: { id: true, name: true } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    const menuUrl = `${frontendUrl}/menu/${restaurant.id}`;

    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#1e40af', light: '#ffffff' },
    });

    res.json({ qrCode: qrDataUrl, menuUrl, restaurant: restaurant.name });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description, cuisine, phone, image, buildingId: reqBuildingId, assignUserIds } = req.body;
    const buildingId = req.user.role === 'BUILDING_MANAGER' ? req.user.buildingId : reqBuildingId;
    if (!name || !buildingId) {
      return res.status(400).json({ message: 'Name and building are required.' });
    }
    const restaurant = await prisma.restaurant.create({
      data: { name, description, cuisine, phone, image, buildingId },
      include: { building: { select: { id: true, name: true } } },
    });

    if (assignUserIds && assignUserIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: assignUserIds } },
        data: { restaurantId: restaurant.id },
      });
    }

    const result = await prisma.restaurant.findUnique({
      where: { id: restaurant.id },
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { menuItems: true, orders: true, users: true } },
      },
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, cuisine, phone, image, isActive, assignUserIds } = req.body;

    if (req.user.role === 'BUILDING_MANAGER' && req.user.buildingId) {
      const existing = await prisma.restaurant.findUnique({ where: { id }, select: { buildingId: true } });
      if (!existing || existing.buildingId !== req.user.buildingId) {
        return res.status(403).json({ message: 'You can only manage restaurants in your own building.' });
      }
    }

    const data = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (cuisine !== undefined) data.cuisine = cuisine;
    if (phone !== undefined) data.phone = phone;
    if (image !== undefined) data.image = image;
    if (isActive !== undefined) data.isActive = isActive;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data,
      include: { building: { select: { id: true, name: true } } },
    });

    if (assignUserIds !== undefined) {
      await prisma.user.updateMany({
        where: { restaurantId: id, id: { notIn: assignUserIds } },
        data: { restaurantId: null },
      });
      await prisma.user.updateMany({
        where: { id: { in: assignUserIds } },
        data: { restaurantId: id },
      });
    }

    const result = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { menuItems: true, orders: true, users: true } },
      },
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.restaurant.delete({ where: { id } });
    res.json({ message: 'Restaurant deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getAllPublic, getById, getByIdPublic, getQrCode, create, update, remove };