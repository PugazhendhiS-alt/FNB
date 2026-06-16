const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');
const { roles, roleHierarchy } = require('../middleware/roles');

const prisma = new PrismaClient();

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { building: true, restaurant: { include: { building: true } } },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user;

    res.json({ token, user: userData });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { username, email, password, role, phone } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, role: role || 'CUSTOMER', phone },
    });

    const token = generateToken(user);
    const { password: _, ...userData } = user;

    res.status(201).json({ token, user: userData });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { building: true, restaurant: { include: { building: true } } },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (err) {
    next(err);
  }
}

async function switchRole(req, res, next) {
  try {
    if (!req.user.isSuperadmin) {
      return res.status(403).json({ message: 'Only superadmin can switch roles.' });
    }
    const { role } = req.body;
    const validRoles = ['SUPERADMIN', 'BUILDING_MANAGER', 'RESTAURANT_MANAGER', 'CHEF', 'CUSTOMER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { building: true, restaurant: { include: { building: true } } } });
    const switchedUser = { ...user, role, activeRole: role, isSuperadmin: true };
    const token = generateToken(switchedUser);
    const { password: _, ...userData } = switchedUser;
    res.json({ token, user: userData, message: `Switched to ${role} role.` });
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;

    if (req.user.role === roles.BUILDING_MANAGER) {
      where.buildingId = req.user.buildingId;
    } else if (req.user.role === roles.RESTAURANT_MANAGER) {
      where.restaurantId = req.user.restaurantId;
    }

    const users = await prisma.user.findMany({
      where,
      include: { building: { select: { id: true, name: true } }, restaurant: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { username, email, password, role, phone, avatar, buildingId, restaurantId } = req.body;

    const requestorLevel = roleHierarchy[req.user.role] || 0;
    const targetLevel = roleHierarchy[role] || 0;
    if (requestorLevel <= targetLevel) {
      return res.status(403).json({ message: 'You cannot create a user with equal or higher role.' });
    }
    if (role === 'SUPERADMIN') {
      return res.status(403).json({ message: 'Only existing superadmins can create superadmins.' });
    }

    const data = { username, email, password: await bcrypt.hash(password, 10), role, phone, avatar };

    if (req.user.role === roles.BUILDING_MANAGER) {
      data.buildingId = req.user.buildingId;
    } else if (req.user.role === roles.RESTAURANT_MANAGER) {
      data.restaurantId = req.user.restaurantId;
      if (buildingId) data.buildingId = buildingId;
    } else {
      if (buildingId) data.buildingId = buildingId;
      if (restaurantId) data.restaurantId = restaurantId;
    }

    const user = await prisma.user.create({
      data,
      include: { building: { select: { id: true, name: true } }, restaurant: { select: { id: true, name: true } } },
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { username, email, password, role, phone, avatar, buildingId, restaurantId } = req.body;

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target) return res.status(404).json({ message: 'User not found.' });

    const requestorLevel = roleHierarchy[req.user.role] || 0;
    const targetLevel = roleHierarchy[target.role] || 0;
    if (requestorLevel <= targetLevel && req.user.id !== id) {
      return res.status(403).json({ message: 'You cannot update a user with equal or higher role.' });
    }
    if (role && role === 'SUPERADMIN') {
      return res.status(403).json({ message: 'Cannot assign superadmin role.' });
    }
    if (role) {
      const newRoleLevel = roleHierarchy[role] || 0;
      if (requestorLevel <= newRoleLevel) {
        return res.status(403).json({ message: 'Cannot assign equal or higher role.' });
      }
    }

    const data = {};
    if (username) data.username = username;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);
    if (role) data.role = role;
    if (phone !== undefined) data.phone = phone;
    if (avatar !== undefined) data.avatar = avatar;

    if (req.user.role === roles.BUILDING_MANAGER) {
      if (buildingId !== undefined && buildingId !== req.user.buildingId) {
        return res.status(403).json({ message: 'You cannot assign a different building.' });
      }
      data.buildingId = req.user.buildingId;
    } else if (req.user.role === roles.RESTAURANT_MANAGER) {
      if (restaurantId !== undefined && restaurantId !== req.user.restaurantId) {
        return res.status(403).json({ message: 'You cannot assign a different restaurant.' });
      }
      data.restaurantId = req.user.restaurantId;
    } else {
      if (buildingId !== undefined) data.buildingId = buildingId;
      if (restaurantId !== undefined) data.restaurantId = restaurantId;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      include: { building: { select: { id: true, name: true } }, restaurant: { select: { id: true, name: true } } },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself.' });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target) return res.status(404).json({ message: 'User not found.' });

    const requestorLevel = roleHierarchy[req.user.role] || 0;
    const targetLevel = roleHierarchy[target.role] || 0;
    if (requestorLevel <= targetLevel) {
      return res.status(403).json({ message: 'You cannot delete a user with equal or higher role.' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, getProfile, switchRole, getAllUsers, createUser, updateUser, deleteUser };