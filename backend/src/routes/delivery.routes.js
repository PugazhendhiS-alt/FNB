const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/delivery.controller');

router.post('/confirm', authenticate, authorize(roles.SUPERADMIN, roles.RESTAURANT_MANAGER), ctrl.confirmDelivery);

module.exports = router;