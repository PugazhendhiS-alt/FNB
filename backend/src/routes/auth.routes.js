const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/auth.controller');
const otpCtrl = require('../controllers/otp.controller');

router.post('/login', ctrl.login);
router.post('/register', ctrl.register);
router.post('/send-otp', otpCtrl.sendOtp);
router.post('/verify-otp', otpCtrl.verifyOtp);
router.post('/guest', otpCtrl.guestLogin);
router.get('/profile', authenticate, ctrl.getProfile);
router.post('/switch-role', authenticate, ctrl.switchRole);

router.get('/users', authenticate, authorize(roles.SUPERADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER), ctrl.getAllUsers);
router.post('/users', authenticate, authorize(roles.SUPERADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER), ctrl.createUser);
router.put('/users/:id', authenticate, authorize(roles.SUPERADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER), ctrl.updateUser);
router.delete('/users/:id', authenticate, authorize(roles.SUPERADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER), ctrl.deleteUser);

module.exports = router;