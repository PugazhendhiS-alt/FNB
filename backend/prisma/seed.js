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

  const building1 = await buildBuilding('Downtown Food Court', '123 Main Street, Downtown', '+1-555-0101', 'Main downtown food court with multiple restaurants');
  const building2 = await buildBuilding('Mall Food Plaza', '456 Shopping Ave, Mall Complex', '+1-555-0102', 'Food plaza inside the city mall');

  const restaurant1 = await buildRestaurant('Spice Kitchen', 'Authentic Indian cuisine with a modern twist', 'Indian', '+1-555-0201', building1);
  const restaurant2 = await buildRestaurant('Pizza Paradise', 'Wood-fired pizzas and Italian classics', 'Italian', '+1-555-0202', building1);
  const restaurant3 = await buildRestaurant('Sushi World', 'Fresh Japanese sushi and ramen', 'Japanese', '+1-555-0203', building2);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const chefPassword = await bcrypt.hash('chef123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const users = [
    { username: 'admin1', email: 'admin@pos.com', password: adminPassword, role: 'ADMIN' },
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
            balance: 250.00,
            isActive: true,
          },
        });
        console.log(`Food Card created for ${username}: ****${cardNumber.slice(-4)} with $250.00 balance`);
      }
    }
  }

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