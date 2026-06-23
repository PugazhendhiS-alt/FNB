const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin12345', 10);

  const superadmin = await prisma.user.upsert({
    where: { username: 'Superadmin' },
    update: {},
    create: {
      id: uuidv4(),
      username: 'Superadmin',
      email: 'superadmin@pos.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
      isSuperadmin: true,
    },
  });

  const buildBuilding = async (name, address, phone, description) => {
    const existing = await prisma.building.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.building.create({ data: { id: uuidv4(), name, address, phone, description } });
  };

  const buildRestaurant = async (name, description, cuisine, phone, building) => {
    const existing = await prisma.restaurant.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.restaurant.create({ data: { id: uuidv4(), name, description, cuisine, phone, buildingId: building.id } });
  };

  const building1 = await buildBuilding('Cyber City Food Court', 'Plot 12, Sector 24, Gurugram', '+91-124-4567890', 'Premium food court in Cyber City tech hub');
  const building2 = await buildBuilding('Phoenix Mall Food Plaza', '3rd Floor, Phoenix Mall, Lower Parel, Mumbai', '+91-22-6789012', 'Food plaza inside Phoenix Marketcity Mall');

  const restaurant1 = await buildRestaurant('Tandoori Tadka', 'Authentic North Indian cuisine with a modern twist', 'North Indian', '+91-124-4567891', building1);
  const restaurant2 = await buildRestaurant('Dosa Express', 'South Indian classics and filter coffee', 'South Indian', '+91-124-4567892', building1);
  const restaurant3 = await buildRestaurant('Roll & Wok', 'Asian fusion rolls and street food', 'Asian', '+91-22-6789013', building2);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const chefPassword = await bcrypt.hash('chef123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const users = [
    { username: 'admin1', email: 'admin1@pos.com', password: adminPassword, role: 'ADMIN' },
    { username: 'bldmgr1', email: 'bldmgr@pos.com', password: managerPassword, role: 'BUILDING_MANAGER', buildingId: building1.id },
    { username: 'restmgr1', email: 'restmgr@pos.com', password: managerPassword, role: 'RESTAURANT_MANAGER', restaurantId: restaurant1.id },
    { username: 'restmgr2', email: 'restmgr2@pos.com', password: managerPassword, role: 'RESTAURANT_MANAGER', restaurantId: restaurant2.id },
    { username: 'chef1', email: 'chef@pos.com', password: chefPassword, role: 'CHEF', restaurantId: restaurant1.id },
    { username: 'customer1', email: 'customer@pos.com', password: customerPassword, role: 'CUSTOMER' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: { id: uuidv4(), ...user, isSuperadmin: false },
    });
  }

  const menuItems = [
    { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 349, category: 'Main Course', foodCategory: 'NON_VEG', restaurantId: restaurant1.id },
    { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 299, category: 'Main Course', foodCategory: 'NON_VEG', restaurantId: restaurant1.id },
    { name: 'Garlic Naan', description: 'Tandoor-baked bread brushed with garlic butter', price: 49, category: 'Bread', foodCategory: 'VEG', restaurantId: restaurant1.id },
    { name: 'Veg Samosa (3 pcs)', description: 'Crispy pastry filled with spiced potatoes', price: 79, category: 'Appetizer', foodCategory: 'VEG', restaurantId: restaurant1.id },
    { name: 'Masala Dosa', description: 'Crispy rice crepe with spiced potato filling', price: 199, category: 'South Indian', foodCategory: 'VEG', restaurantId: restaurant2.id },
    { name: 'Idli Sambar (2 pcs)', description: 'Steamed rice cakes with lentil soup and chutney', price: 129, category: 'South Indian', foodCategory: 'VEG', restaurantId: restaurant2.id },
    { name: 'Filter Coffee', description: 'South Indian style filter coffee', price: 49, category: 'Beverage', foodCategory: 'VEGAN', restaurantId: restaurant2.id },
    { name: 'Vada Pav', description: 'Spiced potato fritter in a bun with chutney', price: 59, category: 'Street Food', foodCategory: 'VEG', restaurantId: restaurant2.id },
    { name: 'Egg Roll', description: 'Kolkata-style egg roll with onions and chutney', price: 149, category: 'Rolls', foodCategory: 'NON_VEG', restaurantId: restaurant3.id },
    { name: 'Chicken Tikka Wrap', description: 'Tandoori chicken wrapped in paratha', price: 249, category: 'Rolls', foodCategory: 'NON_VEG', restaurantId: restaurant3.id },
    { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 179, category: 'Asian', foodCategory: 'VEG', restaurantId: restaurant3.id },
    { name: 'Gobi Manchurian', description: 'Crispy cauliflower in spicy soy-ginger sauce', price: 159, category: 'Appetizer', foodCategory: 'VEG', restaurantId: restaurant3.id },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name, restaurantId: item.restaurantId } });
    if (!existing) {
      await prisma.menuItem.create({ data: { id: uuidv4(), ...item } });
    }
  }

  // Create Food Cards for existing users
  const foodCardUsers = ['customer1', 'customer2', 'customer3'].filter(Boolean);
  const allUsers = await prisma.user.findMany();
  const cardPin = await bcrypt.hash('1234', 10);

  for (const username of foodCardUsers) {
    const u = allUsers.find(user => user.username === username);
    if (u) {
      const existingCard = await prisma.foodCard.findUnique({ where: { userId: u.id } });
      if (!existingCard) {
        let cardNumber;
        let unique = false;
        while (!unique) {
          cardNumber = '411111111111' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
          const dup = await prisma.foodCard.findUnique({ where: { cardNumber } });
          if (!dup) unique = true;
        }
        await prisma.foodCard.create({
          data: {
            userId: u.id,
            cardNumber,
            pin: cardPin,
            balance: 5000,
            isActive: true,
          },
        });
        console.log(`Food Card created for ${username}: ****${cardNumber.slice(-4)} with ₹5,000 balance`);
      }
    }
  }

  const modules = [
    { key: 'dashboard', name: 'Dashboard', description: 'Analytics and overview widgets' },
    { key: 'orders', name: 'Orders', description: 'Order management and tracking' },
    { key: 'inventory', name: 'Inventory', description: 'Stock, vendors, purchase orders' },
    { key: 'menu', name: 'Menu', description: 'Menu item management' },
    { key: 'restaurants', name: 'Restaurants', description: 'Restaurant management' },
    { key: 'buildings', name: 'Buildings', description: 'Building management' },
    { key: 'users', name: 'Users', description: 'User management' },
    { key: 'delivery', name: 'Delivery Confirmation', description: 'Order delivery confirmation' },
    { key: 'modules', name: 'Modules', description: 'Module access management' },
  ];
  for (const mod of modules) {
    await prisma.module.upsert({
      where: { key: mod.key },
      update: { name: mod.name, description: mod.description },
      create: { key: mod.key, name: mod.name, description: mod.description },
    });
  }
  console.log('Default modules created');

  console.log('Seed completed successfully!');
  console.log('Superadmin created: username=Superadmin, password=Admin12345');
  console.log('Sample users created with passwords: admin123, manager123, chef123, customer123');
  console.log('Food Cards created for customers with PIN: 1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });