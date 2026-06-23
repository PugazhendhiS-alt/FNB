require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const { setupSocket } = require('./socket');

const authRoutes = require('./routes/auth.routes');
const buildingRoutes = require('./routes/building.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const paymentRoutes = require('./routes/payment.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const foodCardRoutes = require('./routes/foodcard.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const moduleRoutes = require('./routes/module.routes');
const notificationRoutes = require('./routes/notification.routes');
const customerRoutes = require('./routes/customer.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : undefined;

function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins) {
    return callback(null, allowedOrigins.includes(origin));
  }
  const allowed = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  callback(null, allowed);
}

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/food-card', foodCardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/customer', customerRoutes);

app.use(errorHandler);

setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});