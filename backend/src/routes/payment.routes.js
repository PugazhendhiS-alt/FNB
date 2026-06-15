const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/payment.controller');

router.post('/pay', authenticate, ctrl.processPayment);

module.exports = router;