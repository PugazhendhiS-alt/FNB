const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/order.controller');

router.post('/guest', ctrl.createGuest);
router.get('/', authenticate, ctrl.getAll);
router.get('/code/:code', authenticate, ctrl.getByCode);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', authenticate, authorize(roles.CUSTOMER), ctrl.create);
router.patch('/:id/status', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.updateStatus);

module.exports = router;