const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/foodcard.controller');

router.post('/create', authenticate, ctrl.createCard);
router.get('/card', authenticate, ctrl.getCard);
router.post('/top-up', authenticate, ctrl.topUp);
router.post('/pay', authenticate, ctrl.payWithCard);
router.get('/transactions', authenticate, ctrl.getTransactions);
router.put('/change-pin', authenticate, ctrl.changePin);

module.exports = router;
