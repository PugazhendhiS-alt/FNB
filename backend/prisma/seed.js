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

  const building1 = await prisma.building.create({
    data: {
      id: uuidv4(),
      name: 'Downtown Food Court',
      address: '123 Main Street, Downtown',
      phone: '+1-555-0101',
      description: 'Main downtown food court with multiple restaurants',
    },
  });

  const building2 = await prisma.building.create({
    data: {
      id: uuidv4(),
      name: 'Mall Food Plaza',
      address: '456 Shopping Ave, Mall Complex',
      phone: '+1-555-0102',
      description: 'Food plaza inside the city mall',
    },
  });

  const restaurant1 = await prisma.restaurant.create({
    data: {
      id: uuidv4(),
      name: 'Spice Kitchen',
      description: 'Authentic Indian cuisine with a modern twist',
      cuisine: 'Indian',
      phone: '+1-555-0201',
      buildingId: building1.id,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      id: uuidv4(),
      name: 'Pizza Paradise',
      description: 'Wood-fired pizzas and Italian classics',
      cuisine: 'Italian',
      phone: '+1-555-0202',
      buildingId: building1.id,
    },
  });

  const restaurant3 = await prisma.restaurant.create({
    data: {
      id: uuidv4(),
      name: 'Sushi World',
      description: 'Fresh Japanese sushi and ramen',
      cuisine: 'Japanese',
      phone: '+1-555-0203',
      buildingId: building2.id,
    },
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const chefPassword = await bcrypt.hash('chef123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  await prisma.user.createMany({
    data: [
      {
        id: uuidv4(), username: 'admin1', email: 'admin@pos.com',
        password: adminPassword, role: 'ADMIN', isSuperadmin: false,
      },
      {
        id: uuidv4(), username: 'bldmgr1', email: 'bldmgr@pos.com',
        password: managerPassword, role: 'BUILDING_MANAGER', isSuperadmin: false,
        buildingId: building1.id,
      },
      {
        id: uuidv4(), username: 'restmgr1', email: 'restmgr@pos.com',
        password: managerPassword, role: 'RESTAURANT_MANAGER', isSuperadmin: false,
        restaurantId: restaurant1.id,
      },
      {
        id: uuidv4(), username: 'restmgr2', email: 'restmgr2@pos.com',
        password: managerPassword, role: 'RESTAURANT_MANAGER', isSuperadmin: false,
        restaurantId: restaurant2.id,
      },
      {
        id: uuidv4(), username: 'chef1', email: 'chef@pos.com',
        password: chefPassword, role: 'CHEF', isSuperadmin: false,
        restaurantId: restaurant1.id,
      },
      {
        id: uuidv4(), username: 'customer1', email: 'customer@pos.com',
        password: customerPassword, role: 'CUSTOMER', isSuperadmin: false,
      },
    ],
  });

  const menuItems = [
    { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 14.99, category: 'Main Course', restaurantId: restaurant1.id },
    { name: 'Biryani', description: 'Fragrant basmati rice with spiced meat', price: 12.99, category: 'Main Course', restaurantId: restaurant1.id },
    { name: 'Naan Bread', description: 'Traditional tandoor-baked bread', price: 3.49, category: 'Bread', restaurantId: restaurant1.id },
    { name: 'Samosa (3 pcs)', description: 'Crispy pastry filled with spiced potatoes', price: 5.99, category: 'Appetizer', restaurantId: restaurant1.id },
    { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, basil', price: 11.99, category: 'Pizza', restaurantId: restaurant2.id },
    { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and mozzarella', price: 13.99, category: 'Pizza', restaurantId: restaurant2.id },
    { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 10.99, category: 'Pasta', restaurantId: restaurant2.id },
    { name: 'Garlic Bread', description: 'Toasted bread with garlic butter', price: 4.99, category: 'Appetizer', restaurantId: restaurant2.id },
    { name: 'California Roll', description: 'Crab, avocado, cucumber inside-out roll', price: 8.99, category: 'Sushi', restaurantId: restaurant3.id },
    { name: 'Salmon Nigiri', description: 'Fresh salmon over seasoned rice', price: 6.99, category: 'Sushi', restaurantId: restaurant3.id },
    { name: 'Tonkotsu Ramen', description: 'Rich pork broth ramen with chashu', price: 12.99, category: 'Ramen', restaurantId: restaurant3.id },
    { name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 4.49, category: 'Appetizer', restaurantId: restaurant3.id },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: { id: uuidv4(), ...item },
    });
  }

  console.log('Seed completed successfully!');
  console.log('Superadmin created: username=Superadmin, password=Admin12345');
  console.log('Sample users created with passwords: admin123, manager123, chef123, customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });