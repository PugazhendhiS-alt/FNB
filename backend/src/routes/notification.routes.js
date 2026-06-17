const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/notification.controller');

router.get('/', authenticate, ctrl.getAll);
router.get('/unread-count', authenticate, ctrl.getUnreadCount);
router.patch('/:id/read', authenticate, ctrl.markRead);
router.patch('/read-all', authenticate, ctrl.markAllRead);

module.exports = router;
