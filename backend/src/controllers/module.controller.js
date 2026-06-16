const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllModules(req, res, next) {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(modules);
  } catch (err) {
    next(err);
  }
}

async function getModuleOverrides(req, res, next) {
  try {
    const buildingOverrides = await prisma.buildingModule.findMany({
      include: { building: { select: { id: true, name: true } }, module: true },
    });
    const restaurantOverrides = await prisma.restaurantModule.findMany({
      include: { restaurant: { select: { id: true, name: true } }, module: true },
    });
    const userOverrides = await prisma.userModule.findMany({
      include: { user: { select: { id: true, username: true } }, module: true },
    });
    res.json({ buildingOverrides, restaurantOverrides, userOverrides });
  } catch (err) {
    next(err);
  }
}

async function upsertBuildingModule(req, res, next) {
  try {
    const { buildingId, moduleId, isEnabled } = req.body;
    const override = await prisma.buildingModule.upsert({
      where: { buildingId_moduleId: { buildingId, moduleId } },
      update: { isEnabled },
      create: { buildingId, moduleId, isEnabled },
    });
    res.json(override);
  } catch (err) {
    next(err);
  }
}

async function upsertRestaurantModule(req, res, next) {
  try {
    const { restaurantId, moduleId, isEnabled } = req.body;
    const override = await prisma.restaurantModule.upsert({
      where: { restaurantId_moduleId: { restaurantId, moduleId } },
      update: { isEnabled },
      create: { restaurantId, moduleId, isEnabled },
    });
    res.json(override);
  } catch (err) {
    next(err);
  }
}

async function upsertUserModule(req, res, next) {
  try {
    const { userId, moduleId, isEnabled } = req.body;
    const override = await prisma.userModule.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: { isEnabled },
      create: { userId, moduleId, isEnabled },
    });
    res.json(override);
  } catch (err) {
    next(err);
  }
}

async function deleteBuildingModule(req, res, next) {
  try {
    await prisma.buildingModule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Override removed' });
  } catch (err) {
    next(err);
  }
}

async function deleteRestaurantModule(req, res, next) {
  try {
    await prisma.restaurantModule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Override removed' });
  } catch (err) {
    next(err);
  }
}

async function deleteUserModule(req, res, next) {
  try {
    await prisma.userModule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Override removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllModules,
  getModuleOverrides,
  upsertBuildingModule,
  upsertRestaurantModule,
  upsertUserModule,
  deleteBuildingModule,
  deleteRestaurantModule,
  deleteUserModule,
};
