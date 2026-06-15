const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllPublic(req, res, next) {
  try {
    const { restaurantId } = req.query;
    const where = { available: true };
    if (restaurantId) where.restaurantId = restaurantId;

    const items = await prisma.menuItem.findMany({
      where,
      select: { id: true, name: true, description: true, price: true, category: true, image: true, restaurantId: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function getByIdPublic(req, res, next) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, description: true, price: true, category: true, image: true, restaurantId: true },
    });
    if (!item) return res.status(404).json({ message: 'Menu item not found.' });
    res.json(item);
  } catch (err) { next(err); }
}

async function getAll(req, res, next) {
  try {
    const { restaurantId, category } = req.query;
    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (category) where.category = category;

    if (req.user.role === 'RESTAURANT_MANAGER' && req.user.restaurantId) {
      where.restaurantId = req.user.restaurantId;
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: { restaurant: { select: { id: true, name: true } } },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: { restaurant: { select: { id: true, name: true } } },
    });
    if (!item) return res.status(404).json({ message: 'Menu item not found.' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description, price, category, image, restaurantId } = req.body;
    if (!name || !price || !restaurantId) {
      return res.status(400).json({ message: 'Name, price, and restaurant are required.' });
    }
    const item = await prisma.menuItem.create({
      data: { name, description, price: parseFloat(price), category, image, restaurantId },
      include: { restaurant: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, available } = req.body;
    const data = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (price) data.price = parseFloat(price);
    if (category !== undefined) data.category = category;
    if (image !== undefined) data.image = image;
    if (available !== undefined) data.available = available;

    const item = await prisma.menuItem.update({
      where: { id },
      data,
      include: { restaurant: { select: { id: true, name: true } } },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    res.json({ message: 'Menu item deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getAllPublic, getById, getByIdPublic, create, update, remove };