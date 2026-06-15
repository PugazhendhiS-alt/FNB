const { Server } = require('socket.io');

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-order-room', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('join-restaurant-room', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
    });

    socket.on('join-building-room', (buildingId) => {
      socket.join(`building:${buildingId}`);
    });

    socket.on('join-user-room', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

function emitOrderUpdate(io, orderId, data) {
  io.to(`order:${orderId}`).emit('order-updated', data);
  io.to(`restaurant:${data.restaurantId}`).emit('order-updated', data);
}

function emitNotification(io, userId, notification) {
  io.to(`user:${userId}`).emit('new-notification', notification);
}

module.exports = { setupSocket, emitOrderUpdate, emitNotification };