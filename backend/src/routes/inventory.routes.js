const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roles');
const ctrl = require('../controllers/inventory.controller');

// Categories
router.get('/categories', authenticate, ctrl.getCategories);
router.post('/categories', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER), ctrl.createCategory);
router.put('/categories/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER), ctrl.updateCategory);
router.delete('/categories/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN), ctrl.deleteCategory);

// Items
router.get('/items', authenticate, ctrl.getItems);
router.get('/items/:id', authenticate, ctrl.getItem);
router.post('/items', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.createItem);
router.put('/items/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.updateItem);
router.delete('/items/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN), ctrl.deleteItem);

// Stock
router.patch('/stock', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.updateStock);

// Vendors
router.get('/vendors', authenticate, ctrl.getVendors);
router.post('/vendors', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER), ctrl.createVendor);
router.put('/vendors/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.BUILDING_MANAGER, roles.RESTAURANT_MANAGER), ctrl.updateVendor);
router.delete('/vendors/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN), ctrl.deleteVendor);

// Purchase Orders
router.get('/purchase-orders', authenticate, ctrl.getPurchaseOrders);
router.post('/purchase-orders', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.createPurchaseOrder);
router.put('/purchase-orders/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.updatePurchaseOrder);

// Goods Receipt
router.get('/goods-receipts', authenticate, ctrl.getGoodsReceipts);
router.post('/goods-receipts', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.createGoodsReceipt);

// Transfers
router.get('/transfers', authenticate, ctrl.getTransfers);
router.post('/transfers', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.createTransfer);
router.put('/transfers/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.updateTransfer);

// Adjustments
router.get('/adjustments', authenticate, ctrl.getAdjustments);
router.post('/adjustments', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.createAdjustment);
router.put('/adjustments/:id/approve', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER), ctrl.approveAdjustment);

// Stock Count
router.get('/stock-counts', authenticate, ctrl.getStockCounts);
router.post('/stock-counts', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.createStockCount);
router.put('/stock-counts/:id/reconcile', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.reconcileStockCount);

// Wastage
router.get('/wastage', authenticate, ctrl.getWastage);
router.post('/wastage', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.createWastage);

// Recipe Mapping
router.get('/recipes', authenticate, ctrl.getRecipes);
router.post('/recipes', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.upsertRecipe);
router.delete('/recipes/:id', authenticate, authorize(roles.SUPERADMIN, roles.ADMIN, roles.RESTAURANT_MANAGER, roles.CHEF), ctrl.deleteRecipe);

// Movements
router.get('/movements', authenticate, ctrl.getMovements);

// Dashboard
router.get('/dashboard', authenticate, ctrl.getDashboard);

module.exports = router;
