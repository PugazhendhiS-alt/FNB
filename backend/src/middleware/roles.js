const roles = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  BUILDING_MANAGER: 'BUILDING_MANAGER',
  RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',
  CHEF: 'CHEF',
  CUSTOMER: 'CUSTOMER',
};

const roleHierarchy = {
  SUPERADMIN: 100,
  ADMIN: 90,
  BUILDING_MANAGER: 70,
  RESTAURANT_MANAGER: 50,
  CHEF: 40,
  CUSTOMER: 10,
};

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.isSuperadmin) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }

    next();
  };
}

function authorizeWithData(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.isSuperadmin) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }

    if (req.user.role === roles.BUILDING_MANAGER && req.params.buildingId) {
      if (req.user.buildingId !== req.params.buildingId) {
        return res.status(403).json({ message: 'You can only manage your own building.' });
      }
    }

    if (req.user.role === roles.RESTAURANT_MANAGER && req.params.restaurantId) {
      if (req.user.restaurantId !== req.params.restaurantId) {
        return res.status(403).json({ message: 'You can only manage your own restaurant.' });
      }
    }

    next();
  };
}

module.exports = { authorize, authorizeWithData, roles, roleHierarchy };