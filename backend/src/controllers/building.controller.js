const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const buildings = await prisma.building.findMany({
      include: {
        _count: { select: { restaurants: true, users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(buildings);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const building = await prisma.building.findUnique({
      where: { id: req.params.id },
      include: {
        restaurants: { include: { _count: { select: { menuItems: true, orders: true } } } },
        _count: { select: { restaurants: true } },
      },
    });
    if (!building) return res.status(404).json({ message: 'Building not found.' });
    res.json(building);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, address, phone, description, image, assignUserIds } = req.body;
    if (!name || !address) {
      return res.status(400).json({ message: 'Name and address are required.' });
    }
    const building = await prisma.building.create({
      data: { name, address, phone, description, image },
    });

    if (assignUserIds && assignUserIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: assignUserIds } },
        data: { buildingId: building.id },
      });
    }

    const result = await prisma.building.findUnique({
      where: { id: building.id },
      include: {
        _count: { select: { restaurants: true, users: true } },
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
    const { name, address, phone, description, image, isActive, assignUserIds } = req.body;
    const data = {};
    if (name) data.name = name;
    if (address) data.address = address;
    if (phone !== undefined) data.phone = phone;
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    if (isActive !== undefined) data.isActive = isActive;

    const building = await prisma.building.update({
      where: { id },
      data,
    });

    if (assignUserIds !== undefined) {
      await prisma.user.updateMany({
        where: { buildingId: id, id: { notIn: assignUserIds } },
        data: { buildingId: null },
      });
      await prisma.user.updateMany({
        where: { id: { in: assignUserIds } },
        data: { buildingId: id },
      });
    }

    const result = await prisma.building.findUnique({
      where: { id },
      include: {
        _count: { select: { restaurants: true, users: true } },
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
    const restaurantCount = await prisma.restaurant.count({ where: { buildingId: id } });
    if (restaurantCount > 0) {
      return res.status(400).json({ message: 'Cannot delete building with active restaurants. Remove restaurants first.' });
    }
    await prisma.building.delete({ where: { id } });
    res.json({ message: 'Building deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };