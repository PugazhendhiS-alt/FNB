import client from './client';

export const authAPI = {
  login: (data) => client.post('/auth/login', data),
  register: (data) => client.post('/auth/register', data),
  sendOtp: (data) => client.post('/auth/send-otp', data),
  verifyOtp: (userId, code) => client.post('/auth/verify-otp', { userId, code }),
  guestLogin: (data) => client.post('/auth/guest', data || {}),
  getProfile: () => client.get('/auth/profile'),
  updateProfile: (data) => client.put('/auth/profile', data),
  changePassword: (data) => client.post('/auth/change-password', data),
  verifyPasswordChange: (data) => client.post('/auth/verify-password-change', data),
  switchRole: (role) => client.post('/auth/switch-role', { role }),
  getUsers: () => client.get('/auth/users'),
  createUser: (data) => client.post('/auth/users', data),
  updateUser: (id, data) => client.put(`/auth/users/${id}`, data),
  deleteUser: (id) => client.delete(`/auth/users/${id}`),
};

export const buildingAPI = {
  getAll: () => client.get('/buildings'),
  getById: (id) => client.get(`/buildings/${id}`),
  create: (data) => client.post('/buildings', data),
  update: (id, data) => client.put(`/buildings/${id}`, data),
  delete: (id) => client.delete(`/buildings/${id}`),
};

export const restaurantAPI = {
  getAll: (params) => client.get('/restaurants', { params }),
  getById: (id) => client.get(`/restaurants/${id}`),
  getQrCode: (id) => client.get(`/restaurants/${id}/qrcode`),
  create: (data) => client.post('/restaurants', data),
  update: (id, data) => client.put(`/restaurants/${id}`, data),
  delete: (id) => client.delete(`/restaurants/${id}`),
};

export const menuAPI = {
  getAll: (params) => client.get('/menu', { params }),
  getById: (id) => client.get(`/menu/${id}`),
  create: (data) => client.post('/menu', data),
  update: (id, data) => client.put(`/menu/${id}`, data),
  delete: (id) => client.delete(`/menu/${id}`),
};

export const orderAPI = {
  getAll: (params) => client.get('/orders', { params }),
  getById: (id) => client.get(`/orders/${id}`),
  getByCode: (code) => client.get(`/orders/code/${code}`),
  create: (data) => client.post('/orders', data),
  createGuest: (data) => client.post('/orders/guest', data),
  updateStatus: (id, status) => client.patch(`/orders/${id}/status`, { status }),
};

export const paymentAPI = {
  process: (orderId, success) => client.post('/payment/pay', { orderId, success }),
};

export const deliveryAPI = {
  confirm: (orderCode) => client.post('/delivery/confirm', { orderCode }),
};

export const dashboardAPI = {
  getStats: () => client.get('/dashboard/stats'),
  getRevenueChart: (days = 7) => client.get(`/dashboard/revenue-chart?days=${days}`),
  getOrderStatusDistribution: () => client.get('/dashboard/order-status-distribution'),
  getReports: () => client.get('/dashboard/reports'),
  getSuperAdminOverview: () => client.get('/dashboard/super-admin-overview'),
};

export const foodCardAPI = {
  create: (data) => client.post('/food-card/create', data),
  getCard: () => client.get('/food-card/card'),
  topUp: (data) => client.post('/food-card/top-up', data),
  pay: (data) => client.post('/food-card/pay', data),
  getTransactions: () => client.get('/food-card/transactions'),
  changePin: (data) => client.put('/food-card/change-pin', data),
};

export const widgetAPI = {
  getWidgets: () => client.get('/dashboard/widgets'),
  addWidget: (data) => client.post('/dashboard/widgets', data),
  updateWidget: (id, data) => client.put(`/dashboard/widgets/${id}`, data),
  deleteWidget: (id) => client.delete(`/dashboard/widgets/${id}`),
  createCustom: (data) => client.post('/dashboard/widgets/custom', data),
  updateCustom: (id, data) => client.put(`/dashboard/widgets/custom/${id}`, data),
  getAvailable: () => client.get('/dashboard/widgets/available'),
  getWidgetData: (data) => client.post('/dashboard/widgets/data', data),
  batchData: (widgetIds) => client.post('/dashboard/widgets/batch-data', { widgetIds }),
};

export const inventoryAPI = {
  getDashboard: (params) => client.get('/inventory/dashboard', { params }),
  getCategories: () => client.get('/inventory/categories'),
  createCategory: (data) => client.post('/inventory/categories', data),
  updateCategory: (id, data) => client.put(`/inventory/categories/${id}`, data),
  deleteCategory: (id) => client.delete(`/inventory/categories/${id}`),
  getItems: (params) => client.get('/inventory/items', { params }),
  getItem: (id) => client.get(`/inventory/items/${id}`),
  createItem: (data) => client.post('/inventory/items', data),
  updateItem: (id, data) => client.put(`/inventory/items/${id}`, data),
  deleteItem: (id) => client.delete(`/inventory/items/${id}`),
  updateStock: (data) => client.patch('/inventory/stock', data),
  getVendors: () => client.get('/inventory/vendors'),
  createVendor: (data) => client.post('/inventory/vendors', data),
  updateVendor: (id, data) => client.put(`/inventory/vendors/${id}`, data),
  deleteVendor: (id) => client.delete(`/inventory/vendors/${id}`),
  getPurchaseOrders: (params) => client.get('/inventory/purchase-orders', { params }),
  createPurchaseOrder: (data) => client.post('/inventory/purchase-orders', data),
  updatePurchaseOrder: (id, data) => client.put(`/inventory/purchase-orders/${id}`, data),
  getGoodsReceipts: (params) => client.get('/inventory/goods-receipts', { params }),
  createGoodsReceipt: (data) => client.post('/inventory/goods-receipts', data),
  getTransfers: (params) => client.get('/inventory/transfers', { params }),
  createTransfer: (data) => client.post('/inventory/transfers', data),
  updateTransfer: (id, data) => client.put(`/inventory/transfers/${id}`, data),
  getAdjustments: (params) => client.get('/inventory/adjustments', { params }),
  createAdjustment: (data) => client.post('/inventory/adjustments', data),
  approveAdjustment: (id) => client.put(`/inventory/adjustments/${id}/approve`),
  getStockCounts: (params) => client.get('/inventory/stock-counts', { params }),
  createStockCount: (data) => client.post('/inventory/stock-counts', data),
  reconcileStockCount: (id) => client.put(`/inventory/stock-counts/${id}/reconcile`),
  getWastage: (params) => client.get('/inventory/wastage', { params }),
  createWastage: (data) => client.post('/inventory/wastage', data),
  getRecipes: (params) => client.get('/inventory/recipes', { params }),
  upsertRecipe: (data) => client.post('/inventory/recipes', data),
  deleteRecipe: (id) => client.delete(`/inventory/recipes/${id}`),
  getMovements: (params) => client.get('/inventory/movements', { params }),
};

export const notificationAPI = {
  getAll: () => client.get('/notifications'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  markRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllRead: () => client.patch('/notifications/read-all'),
};

export const moduleAPI = {
  getAll: () => client.get('/modules'),
  getMyAccess: () => client.get('/modules/my-access'),
  getOverrides: () => client.get('/modules/overrides'),
  upsertBuilding: (data) => client.post('/modules/building', data),
  upsertRestaurant: (data) => client.post('/modules/restaurant', data),
  upsertUser: (data) => client.post('/modules/user', data),
  deleteBuilding: (id) => client.delete(`/modules/building/${id}`),
  deleteRestaurant: (id) => client.delete(`/modules/restaurant/${id}`),
  deleteUser: (id) => client.delete(`/modules/user/${id}`),
};