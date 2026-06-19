const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/payment.controller');

router.post('/pay', authenticate, authorize(roles.CUSTOMER), ctrl.processPayment);

module.exports = router;