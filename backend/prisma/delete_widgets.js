const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const all = await p.userWidget.deleteMany({});
  console.log('Deleted', all.count, 'total widgets from all users');
  await p.$disconnect();
})();
