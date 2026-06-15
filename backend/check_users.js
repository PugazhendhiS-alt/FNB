const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany().then(u => {
  console.log('Users:', u.length);
  u.forEach(x => console.log(' -', x.username, x.role));
  p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
