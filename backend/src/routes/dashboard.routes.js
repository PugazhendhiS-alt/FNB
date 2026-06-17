const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/dashboard.controller');
const widget = require('../controllers/widget.controller');

router.get('/stats', authenticate, ctrl.getStats);
router.get('/revenue-chart', authenticate, ctrl.getRevenueChart);
router.get('/order-status-distribution', authenticate, ctrl.getOrderStatusDistribution);
router.get('/super-admin-overview', authenticate, ctrl.getSuperAdminOverview);
router.get('/section-data', authenticate, ctrl.getSectionData);
router.get('/reports', authenticate, ctrl.getReports);

router.get('/widgets', authenticate, widget.getWidgets);
router.post('/widgets', authenticate, widget.addWidget);
router.put('/widgets/:id', authenticate, widget.updateWidget);
router.delete('/widgets/:id', authenticate, widget.deleteWidget);
router.post('/widgets/custom', authenticate, widget.createCustomWidget);
router.put('/widgets/custom/:id', authenticate, widget.updateCustomWidget);
router.get('/widgets/available', authenticate, widget.getAvailableWidgets);
router.post('/widgets/data', authenticate, widget.getWidgetData);
router.post('/widgets/batch-data', authenticate, widget.batchWidgetData);

module.exports = router;
