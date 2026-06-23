const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

function generateOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 14) + 8);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d;
}

async function main() {
  // Get existing data
  const users = await prisma.user.findMany();
  const menuItems = await prisma.menuItem.findMany({ include: { restaurant: true } });
  const restaurants = await prisma.restaurant.findMany();

  console.log(`Found ${users.length} users, ${menuItems.length} menu items, ${restaurants.length} restaurants`);

  const superadmin = users.find(u => u.username === 'Superadmin');
  const customer1 = users.find(u => u.username === 'customer1');
  const restmgr1 = users.find(u => u.username === 'restmgr1');
  const restmgr2 = users.find(u => u.username === 'restmgr2');
  const guest = users.find(u => u.username.startsWith('guest'));

  // --- ADD PHONE NUMBERS to all users for OTP ---
  const phones = {
    'Superadmin': '+91-9876543210',
    'admin1': '+91-9876543211',
    'bldmgr1': '+91-9876543212',
    'restmgr1': '+91-9876543213',
    'restmgr2': '+91-9876543214',
    'chef1': '+91-9876543215',
    'customer1': '+91-9876543216',
  };

  for (const u of users) {
    if (phones[u.username]) {
      await prisma.user.update({
        where: { id: u.id },
        data: { phone: phones[u.username] },
      });
      console.log(`  Phone added to ${u.username}: ${phones[u.username]}`);
    }
  }

  // --- ADD MORE USERS for testing ---
  const customerPwd = await bcrypt.hash('customer123', 10);
  const adminPwd = await bcrypt.hash('admin123', 10);

  const chefPwd = await bcrypt.hash('chef123', 10);

  const extraUsers = [
    { username: 'customer2', email: 'customer2@pos.com', role: 'CUSTOMER', phone: '+91-9876543221' },
    { username: 'customer3', email: 'customer3@pos.com', role: 'CUSTOMER', phone: '+91-9876543222' },
    { username: 'chef2', email: 'chef2@pos.com', role: 'CHEF', phone: '+91-9876543223', restaurantId: restaurants.find(r => r.name === 'Roll & Wok')?.id },
  ];

  for (const eu of extraUsers) {
    const exists = await prisma.user.findUnique({ where: { username: eu.username } });
    if (!exists) {
      const password = eu.role === 'CHEF' ? chefPwd : customerPwd;
      const { role, ...rest } = eu;
      await prisma.user.create({
        data: { id: uuidv4(), password, role, ...rest },
      });
      console.log(`  User created: ${eu.username}`);
    } else {
      console.log(`  User exists: ${eu.username}`);
    }
  }

  // --- ADD MORE MENU ITEMS ---
  const extraMenu = [
    { name: 'Paneer Butter Masala', description: 'Rich creamy paneer in tomato gravy', price: 299, category: 'Main Course', restaurantName: 'Tandoori Tadka' },
    { name: 'Dal Makhani', description: 'Slow-cooked black lentils with cream', price: 249, category: 'Main Course', restaurantName: 'Tandoori Tadka' },
    { name: 'Mango Lassi', description: 'Creamy yogurt mango drink', price: 99, category: 'Beverage', restaurantName: 'Tandoori Tadka' },
    { name: 'Rava Dosa', description: 'Crispy semolina crepe with chutney', price: 179, category: 'South Indian', restaurantName: 'Dosa Express' },
    { name: 'Onion Uttapam', description: 'Thick rice pancake with onions', price: 149, category: 'South Indian', restaurantName: 'Dosa Express' },
    { name: 'Gulab Jamun (2 pcs)', description: 'Deep-fried milk dumplings in sugar syrup', price: 79, category: 'Dessert', restaurantName: 'Dosa Express' },
    { name: 'Paneer Kathi Roll', description: 'Spiced paneer wrapped in paratha', price: 199, category: 'Rolls', restaurantName: 'Roll & Wok' },
    { name: 'Sweet Corn Soup', description: 'Hot and sweet corn soup with veggies', price: 129, category: 'Soup', restaurantName: 'Roll & Wok' },
    { name: 'Kulfi Falooda', description: 'Indian ice cream with vermicelli and rose syrup', price: 149, category: 'Dessert', restaurantName: 'Roll & Wok' },
    { name: 'Chicken Roll', description: 'Spiced chicken wrapped in rumali roti', price: 179, category: 'Rolls', restaurantName: 'Roll & Wok' },
    { name: 'Mix Veg Wrap', description: 'Fresh vegetables in whole wheat wrap', price: 129, category: 'Wraps', restaurantName: 'Tandoori Tadka' },
  ];

  for (const em of extraMenu) {
    const rest = restaurants.find(r => r.name === em.restaurantName);
    if (!rest) {
      console.log(`  SKIP: Restaurant "${em.restaurantName}" not found for "${em.name}"`);
      continue;
    }
    const exists = await prisma.menuItem.findFirst({ where: { name: em.name, restaurantId: rest.id } });
    if (!exists) {
      await prisma.menuItem.create({
        data: { id: uuidv4(), name: em.name, description: em.description, price: em.price, category: em.category, restaurantId: rest.id },
      });
      console.log(`  Menu item created: ${em.name} (${em.restaurantName})`);
    }
  }

  // Refresh data
  const allMenuItems = await prisma.menuItem.findMany({ include: { restaurant: true } });
  const allUsers = await prisma.user.findMany();
  const customer = allUsers.find(u => u.username === 'customer1') || customer1;
  const allRestaurants = await prisma.restaurant.findMany();

  // --- CREATE ORDERS with various statuses ---
  if (customer) {
    const statuses = ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'PENDING_PAYMENT'];

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const rest = allRestaurants[i % allRestaurants.length];
      const restItems = allMenuItems.filter(m => m.restaurantId === rest.id);

      if (restItems.length === 0) continue;

      const itemCount = Math.floor(Math.random() * 3) + 1;
      const selectedItems = [];
      const usedIds = new Set();
      for (let j = 0; j < itemCount; j++) {
        const avail = restItems.filter(m => !usedIds.has(m.id));
        if (avail.length === 0) break;
        const pick = avail[Math.floor(Math.random() * avail.length)];
        usedIds.add(pick.id);
        selectedItems.push({
          menuItemId: pick.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          unitPrice: pick.price,
        });
      }

      if (selectedItems.length === 0) continue;

      const totalAmount = selectedItems.reduce((sum, si) => sum + si.unitPrice * si.quantity, 0);
      const orderCode = generateOrderCode();
      const createdAt = randomDate(14);

      const order = await prisma.order.create({
        data: {
          id: uuidv4(),
          orderCode,
          status,
          totalAmount: Math.round(totalAmount * 100) / 100,
          paymentStatus: status === 'CANCELLED' ? 'REFUNDED' : status === 'PENDING_PAYMENT' ? 'PENDING' : 'PAID',
          paymentMethod: status === 'CANCELLED' ? null : status === 'PENDING_PAYMENT' ? null : 'CARD',
          customerId: customer.id,
          restaurantId: rest.id,
          createdById: customer.id,
          createdAt,
          updatedAt: createdAt,
          items: {
            create: selectedItems.map(si => ({
              id: uuidv4(),
              quantity: si.quantity,
              unitPrice: si.unitPrice,
              menuItemId: si.menuItemId,
            })),
          },
        },
      });
      console.log(`  Order ${orderCode}: ${status}, ₹${order.totalAmount}, ${rest.name}`);
    }
  }

  // --- CREATE SUPERADMIN WIDGETS ---
  if (superadmin) {
    const existingWidgets = await prisma.userWidget.findMany({ where: { userId: superadmin.id } });
    if (existingWidgets.length === 0) {
      const defaultWidgets = [
        { title: 'Daily Revenue', widgetType: 'revenue', displayType: 'chart', position: 0, layout: '{"w":4,"h":2,"x":0,"y":0}' },
        { title: 'Order Volume', widgetType: 'orders', displayType: 'chart', position: 1, layout: '{"w":4,"h":2,"x":4,"y":0}' },
        { title: 'Active Orders', widgetType: 'activeOrders', displayType: 'stat', position: 2, layout: '{"w":2,"h":1,"x":0,"y":2}' },
        { title: 'Pending Payments', widgetType: 'pendingPayments', displayType: 'stat', position: 3, layout: '{"w":2,"h":1,"x":2,"y":2}' },
        { title: 'Top Items', widgetType: 'topItems', displayType: 'list', position: 4, layout: '{"w":2,"h":2,"x":0,"y":3}' },
        { title: 'Recent Orders', widgetType: 'recentOrders', displayType: 'list', position: 5, layout: '{"w":4,"h":2,"x":2,"y":3}' },
        { title: 'Customers Today', widgetType: 'customersToday', displayType: 'stat', position: 6, layout: '{"w":2,"h":1,"x":4,"y":2}' },
        { title: 'Avg Order Value', widgetType: 'avgOrderValue', displayType: 'stat', position: 7, layout: '{"w":2,"h":1,"x":6,"y":2}' },
      ];

      for (const w of defaultWidgets) {
        await prisma.userWidget.create({
          data: {
            id: uuidv4(),
            userId: superadmin.id,
            ...w,
          },
        });
      }
      console.log(`  Created ${defaultWidgets.length} widgets for superadmin`);
    } else {
      console.log(`  Superadmin already has ${existingWidgets.length} widgets`);
    }
  }

  console.log('\n=== Seed data added successfully! ===');
  console.log('\nDemo credentials:');
  console.log('  Superadmin / Admin12345 (all access)');
  console.log('  admin1 / admin123 (Admin)');
  console.log('  bldmgr1 / manager123 (Building Manager)');
  console.log('  restmgr1 / manager123 (Restaurant Manager - Tandoori Tadka)');
  console.log('  restmgr2 / manager123 (Restaurant Manager - Dosa Express)');
  console.log('  chef1 / chef123 (Chef - Tandoori Tadka)');
  console.log('  customer1 / customer123 (Customer)');
  console.log('  customer2 / customer123 (Customer)');
  console.log('\nOTP login available: all users have phone numbers');
  console.log('Orders created: 8 orders across all restaurants with various statuses');
  console.log('Superadmin dashboard: 8 widgets configured');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
