const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/module.controller');

router.get('/', authenticate, authorize(roles.SUPERADMIN), ctrl.getAllModules);
router.get('/overrides', authenticate, authorize(roles.SUPERADMIN), ctrl.getModuleOverrides);
router.post('/building', authenticate, authorize(roles.SUPERADMIN), ctrl.upsertBuildingModule);
router.post('/restaurant', authenticate, authorize(roles.SUPERADMIN), ctrl.upsertRestaurantModule);
router.post('/user', authenticate, authorize(roles.SUPERADMIN), ctrl.upsertUserModule);
router.delete('/building/:id', authenticate, authorize(roles.SUPERADMIN), ctrl.deleteBuildingModule);
router.delete('/restaurant/:id', authenticate, authorize(roles.SUPERADMIN), ctrl.deleteRestaurantModule);
router.delete('/user/:id', authenticate, authorize(roles.SUPERADMIN), ctrl.deleteUserModule);

module.exports = router;
