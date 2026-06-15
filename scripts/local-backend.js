import { createServer } from 'http';
import { readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'local-backend-data.json');
const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;

const defaultData = {
  cafeterias: [],
  menuItems: [],
  orders: [],
};

const loadData = async () => {
  try {
    const raw = await readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return defaultData;
  }
};

const saveData = async (data) => {
  await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
};

const sendJson = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
};

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    if (!body) {
      resolve(null);
      return;
    }
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

const getId = (prefix) => `${prefix}${Math.floor(Date.now() + Math.random() * 10000)}`;

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const pathSegments = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const method = req.method ?? 'GET';

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (pathname === '/health' && method === 'GET') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  const data = await loadData();
  data.cafeterias = data.cafeterias ?? [];
  data.menuItems = data.menuItems ?? [];
  data.orders = data.orders ?? [];

  if (pathname === '/cafeterias') {
    if (method === 'GET') {
      sendJson(res, 200, data.cafeterias);
      return;
    }

    if (method === 'POST') {
      const body = await parseBody(req);
      const cafeteria = {
        id: body?.id ?? getId('c'),
        buildingId: body?.buildingId ?? body?.building_id ?? '',
        name: body?.name ?? '',
        image: body?.image ?? '',
        cuisine: body?.cuisine ?? '',
        openTime: body?.openTime ?? body?.open_time ?? '',
        closeTime: body?.closeTime ?? body?.close_time ?? '',
        isOpen: body?.isOpen ?? body?.is_open ?? false,
        rating: body?.rating ?? 0,
      };
      data.cafeterias.push(cafeteria);
      await saveData(data);
      sendJson(res, 201, cafeteria);
      return;
    }
  }

  if (pathSegments[0] === 'cafeterias' && pathSegments[1]) {
    const id = pathSegments[1];
    const cafeteriaIndex = data.cafeterias.findIndex((item) => item.id === id);

    if (cafeteriaIndex === -1) {
      sendJson(res, 404, { error: 'Cafeteria not found' });
      return;
    }

    if (method === 'PUT') {
      const updates = await parseBody(req);
      data.cafeterias[cafeteriaIndex] = {
        ...data.cafeterias[cafeteriaIndex],
        ...updates,
      };
      await saveData(data);
      sendJson(res, 200, data.cafeterias[cafeteriaIndex]);
      return;
    }

    if (method === 'DELETE') {
      data.cafeterias.splice(cafeteriaIndex, 1);
      data.menuItems = data.menuItems.filter((item) => item.cafeteriaId !== id && item.cafeteria_id !== id);
      await saveData(data);
      sendJson(res, 204, {});
      return;
    }
  }

  if (pathname === '/menu-items') {
    if (method === 'GET') {
      sendJson(res, 200, data.menuItems);
      return;
    }

    if (method === 'POST') {
      const body = await parseBody(req);
      const menuItem = {
        id: body?.id ?? getId('m'),
        cafeteriaId: body?.cafeteriaId ?? body?.cafeteria_id ?? '',
        name: body?.name ?? '',
        description: body?.description ?? '',
        price: body?.price ?? 0,
        image: body?.image ?? '',
        category: body?.category ?? '',
        isVeg: body?.isVeg ?? body?.is_veg ?? false,
        isVegan: body?.isVegan ?? body?.is_vegan ?? false,
        calories: body?.calories ?? 0,
        prepTime: body?.prepTime ?? body?.prep_time ?? '',
      };
      data.menuItems.push(menuItem);
      await saveData(data);
      sendJson(res, 201, menuItem);
      return;
    }
  }

  if (pathSegments[0] === 'menu-items' && pathSegments[1]) {
    const id = pathSegments[1];
    const itemIndex = data.menuItems.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      sendJson(res, 404, { error: 'Menu item not found' });
      return;
    }

    if (method === 'PUT') {
      const updates = await parseBody(req);
      data.menuItems[itemIndex] = {
        ...data.menuItems[itemIndex],
        ...updates,
      };
      await saveData(data);
      sendJson(res, 200, data.menuItems[itemIndex]);
      return;
    }

    if (method === 'DELETE') {
      data.menuItems.splice(itemIndex, 1);
      await saveData(data);
      sendJson(res, 204, {});
      return;
    }
  }

  if (pathname === '/orders') {
    if (method === 'GET') {
      sendJson(res, 200, data.orders);
      return;
    }

    if (method === 'POST') {
      const body = await parseBody(req);
      const createdAt = body?.createdAt ?? body?.created_at ?? new Date().toISOString();
      const updatedAt = body?.updatedAt ?? body?.updated_at ?? createdAt;
      const order = {
        id: body?.id ?? getId('ord'),
        cafeteriaId: body?.cafeteriaId ?? body?.cafeteria_id ?? '',
        userId: body?.userId ?? body?.user_id ?? '',
        userName: body?.userName ?? body?.user_name ?? '',
        userEmail: body?.userEmail ?? body?.user_email ?? '',
        items: body?.items ?? [],
        totalAmount: body?.totalAmount ?? body?.total_amount ?? 0,
        status: body?.status ?? 'pending',
        specialInstructions: body?.specialInstructions ?? body?.special_instructions ?? '',
        createdAt,
        updatedAt,
      };
      data.orders.push(order);
      await saveData(data);
      sendJson(res, 201, order);
      return;
    }
  }

  if (pathSegments[0] === 'orders' && pathSegments[1]) {
    const id = pathSegments[1];
    const orderIndex = data.orders.findIndex((order) => order.id === id);

    if (orderIndex === -1) {
      sendJson(res, 404, { error: 'Order not found' });
      return;
    }

    if (method === 'PUT') {
      const updates = await parseBody(req);
      data.orders[orderIndex] = {
        ...data.orders[orderIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await saveData(data);
      sendJson(res, 200, data.orders[orderIndex]);
      return;
    }

    if (method === 'DELETE') {
      data.orders.splice(orderIndex, 1);
      await saveData(data);
      sendJson(res, 204, {});
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Local backend stub listening on http://localhost:${PORT}`);
  console.log(`Data file: ${dataPath}`);
});
