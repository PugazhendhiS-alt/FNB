const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');

function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Invalid or expired token'));
    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-order-room', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('join-restaurant-room', (restaurantId) => {
      if (socket.user.isSuperadmin || socket.user.restaurantId === restaurantId || socket.user.role === 'BUILDING_MANAGER') {
        socket.join(`restaurant:${restaurantId}`);
      }
    });

    socket.on('join-building-room', (buildingId) => {
      if (socket.user.isSuperadmin || socket.user.buildingId === buildingId) {
        socket.join(`building:${buildingId}`);
      }
    });

    socket.on('join-user-room', (userId) => {
      if (socket.user.id === userId || socket.user.isSuperadmin) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

function emitOrderUpdate(io, orderId, data) {
  io.to(`order:${orderId}`).emit('order-updated', data);
  io.to(`restaurant:${data.restaurantId}`).emit('order-updated', data);
  if (data.customerId) {
    io.to(`user:${data.customerId}`).emit('order-status-changed', data);
    io.to(`user:${data.customerId}`).emit('order-updated', data);
  }
}

function emitNotification(io, userId, notification) {
  io.to(`user:${userId}`).emit('new-notification', notification);
}

function emitStaffNotification(io, restaurantId, notification) {
  io.to(`restaurant:${restaurantId}`).emit('new-notification', notification);
}

function emitDashboardUpdate(io, eventType, scope = {}) {
  io.emit('dashboard-update', { type: eventType, timestamp: Date.now(), ...scope });
}

module.exports = { setupSocket, emitOrderUpdate, emitNotification, emitStaffNotification, emitDashboardUpdate };