const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/restaurant.controller');

router.get('/', authenticate, ctrl.getAll);
router.get('/public', ctrl.getAllPublic);
router.get('/:id/qrcode', ctrl.getQrCode);
router.get('/:id', authenticate, ctrl.getById);
router.get('/:id/public', ctrl.getByIdPublic);
router.post('/', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER), ctrl.create);
router.put('/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER), ctrl.update);
router.delete('/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN), ctrl.remove);

module.exports = router;