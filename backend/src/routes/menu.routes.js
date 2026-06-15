const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/menu.controller');

router.get('/', authenticate, ctrl.getAll);
router.get('/public', ctrl.getAllPublic);
router.get('/:id', authenticate, ctrl.getById);
router.get('/:id/public', ctrl.getByIdPublic);
router.post('/', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.create);
router.put('/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.update);
router.delete('/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.remove);

module.exports = router;