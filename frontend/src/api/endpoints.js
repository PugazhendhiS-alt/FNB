import client from './client';

export const authAPI = {
  login: (data) => client.post('/auth/login', data),
  register: (data) => client.post('/auth/register', data),
  sendOtp: (data) => client.post('/auth/send-otp', data),
  verifyOtp: (userId, code) => client.post('/auth/verify-otp', { userId, code }),
  guestLogin: (data) => client.post('/auth/guest', data || {}),
  getProfile: () => client.get('/auth/profile'),
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
  getAll: () => client.get('/restaurants'),
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