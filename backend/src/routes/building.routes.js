const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/building.controller');

router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER), ctrl.create);
router.put('/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER), ctrl.update);
router.delete('/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN), ctrl.remove);

module.exports = router;