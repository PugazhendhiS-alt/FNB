const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/customer.controller');

router.get('/dashboard', authenticate, ctrl.getDashboard);
router.get('/recommendations', authenticate, ctrl.getRecommendations);
router.get('/offers', authenticate, ctrl.getOffers);

module.exports = router;
