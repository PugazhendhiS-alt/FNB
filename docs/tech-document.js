const PDFDocument = require('pdfkit');
const fs = require('fs');

const VER = '1.0', DATE = 'June 2026', COMPANY = 'FnB Platform';
const M = 55, PW = 595.28, PH = 841.89, W = PW - 2 * M, BL = 70;
const BLUE = '#1e40af', DARK = '#0f172a', GRAY = '#334155', LIGHT = '#94a3b8';

let pg = 0;

const doc = new PDFDocument({
  size: 'A4', margin: M,
  info: { Title: 'POS System - Technical Documentation', Author: COMPANY },
});
const out = fs.createWriteStream('POS_System_Technical_Documentation.pdf');
doc.pipe(out);

function setupPage() {
  doc.fontSize(7).fillColor(LIGHT).font('Helvetica');
  doc.text('POS System', M, 12, { continued: true });
  doc.text('Technical Documentation', M + 50, 12);
  doc.text(`Page ${pg}`, PW - M - 40, 12, { align: 'right', width: 40 });
  doc.text(`Version ${VER} | ${DATE}`, M, PH - 18, { align: 'center', width: W });
  doc.text('CONFIDENTIAL', M, PH - 30, { align: 'center', width: W });
  doc.moveTo(M, PH - 40).lineTo(PW - M, PH - 40).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
}
function np() { doc.addPage(); pg++; setupPage(); }
function need(h) { if (doc.y + h > PH - BL) np(); }

function h1(t) { need(55); doc.fontSize(22).fillColor(DARK).font('Helvetica-Bold').text(t); doc.moveDown(0.2); doc.moveTo(M, doc.y).lineTo(PW - M, doc.y).strokeColor(BLUE).lineWidth(2).stroke(); doc.moveDown(0.6); }
function h2(t) { need(35); doc.fontSize(14).fillColor('#1e293b').font('Helvetica-Bold').text(t); doc.moveDown(0.35); }
function h3(t) { need(25); doc.fontSize(11).fillColor('#475569').font('Helvetica-Bold').text(t); doc.moveDown(0.25); }
function p(t) { if (!t) return; need(18); doc.fontSize(9.5).fillColor(GRAY).font('Helvetica').text(t, { align: 'justify', lineGap: 3 }); doc.moveDown(0.25); }
function li(t) { need(13); doc.fontSize(9.5).fillColor(GRAY).text(`\u2022  ${t}`, { indent: 15, lineGap: 3 }); doc.moveDown(0.08); }

function callout(type, text) {
  need(28); const y0 = doc.y;
  const colors = { note: { bg: '#fefce8', border: '#facc15', title: '#92400e', text: '#78350f' }, tip: { bg: '#eff6ff', border: '#3b82f6', title: '#1e40af', text: '#1e3a8a' } };
  const c = colors[type] || colors.note;
  doc.rect(M, y0, W, 28).fill(c.bg); doc.rect(M, y0, W, 28).stroke(c.border).lineWidth(0.5);
  doc.fontSize(8).fillColor(c.title).font('Helvetica-Bold').text(type.toUpperCase() + ':', M + 6, y0 + 4);
  doc.font('Helvetica').fontSize(8.5).fillColor(c.text).text(text, M + 30, y0 + 4, { width: W - 36 });
  doc.moveDown(30 / doc.currentLineHeight() + 0.2);
}

function drawTable(headers, rows, colWidths) {
  if (!rows || rows.length === 0) return;
  const rh = 16, fs = 7.5;
  const totalH = (rows.length + 1) * rh + 4;
  need(totalH + 8);
  const y0 = doc.y, x0 = M + 3;
  const cw = colWidths || headers.map(() => (W - 6) / headers.length);
  doc.rect(x0, y0, W - 6, rh).fill(BLUE);
  doc.fillColor('#fff').fontSize(fs).font('Helvetica-Bold');
  let hx = x0;
  headers.forEach((h, i) => { doc.text(h, hx + 3, y0 + 4, { width: cw[i] - 6 }); hx += cw[i]; });
  let ry = y0 + rh;
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? '#f8fafc' : '#fff';
    doc.rect(x0, ry, W - 6, rh).fill(bg); doc.rect(x0, ry, W - 6, rh).stroke('#e2e8f0').lineWidth(0.3);
    doc.fillColor(GRAY).fontSize(fs).font('Helvetica');
    let rx = x0;
    row.forEach((cell, i) => { doc.text(cell, rx + 3, ry + 4, { width: cw[i] - 6 }); rx += cw[i]; });
    ry += rh;
  });
  doc.moveDown(totalH / doc.currentLineHeight() + 0.3);
}

let figNum = 0;
function screenshot(name, description, elements) {
  figNum++; const boxH = 65; need(boxH + 18);
  const y0 = doc.y;
  doc.rect(M, y0, W, boxH).fill('#f8fafc'); doc.rect(M, y0, W, boxH).stroke('#cbd5e1').lineWidth(0.5);
  doc.rect(M, y0, W, 15).fill(BLUE);
  doc.fillColor('#fff').fontSize(7.5).font('Helvetica-Bold').text(`Figure ${figNum} \u2013 ${name}`, M + 6, y0 + 3);
  doc.fillColor(GRAY).fontSize(7).font('Helvetica');
  let ey = y0 + 18;
  if (description) { doc.text(description, M + 8, ey, { width: W - 16 }); ey += 11; }
  if (elements) elements.forEach(el => { doc.fillColor(BLUE).fontSize(7).text(`\u2022 ${el}`, M + 8, ey, { width: W - 16 }); ey += 8; });
  doc.moveDown(boxH / doc.currentLineHeight() + 0.3);
}

function flowBox(text, x, y, w, h, fill, tc) {
  doc.roundedRect(x, y, w, h, 3).fill(fill || '#eff6ff');
  doc.roundedRect(x, y, w, h, 3).stroke('#93c5fd').lineWidth(0.8);
  doc.fillColor(tc || '#1e3a5f').fontSize(7.5).font('Helvetica-Bold');
  const ls = text.split('\n'), lh2 = 9, tot = ls.length * lh2;
  let sy = y + (h - tot) / 2 + lh2 * 0.6;
  ls.forEach(l => { doc.text(l, x + 3, sy, { width: w - 6, align: 'center', lineGap: 0 }); sy += lh2; });
}
function flowArrow(x1, y1, x2, y2) {
  doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor('#93c5fd').lineWidth(1).stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1);
  doc.moveTo(x2, y2); doc.lineTo(x2 - 4 * Math.cos(ang - 0.4), y2 - 4 * Math.sin(ang - 0.4));
  doc.lineTo(x2 - 4 * Math.cos(ang + 0.4), y2 - 4 * Math.sin(ang + 0.4)); doc.closePath().fill('#93c5fd');
}
function flowChart(title, steps) {
  if (!steps || steps.length === 0) return;
  const bw = 130, bh = 24, gap = 8, total = steps.length * (bh + gap) - gap + 14;
  need(total + 20);
  const sx = M + W / 2 - bw / 2, sy = doc.y + 2;
  doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold').text(title || 'Process Flow', { indent: 5 }); doc.moveDown(0.15);
  let y = sy;
  steps.forEach((s, i) => {
    const isDecision = s.includes('?');
    if (isDecision) {
      const dw = 100, dh = 24;
      doc.save(); doc.translate(sx + (bw - dw) / 2 + dw / 2, y + dh / 2).rotate(45);
      doc.rect(-dw / 2, -dh / 2, dw, dh).fill('#fef3c7'); doc.rect(-dw / 2, -dh / 2, dw, dh).stroke('#fbbf24').lineWidth(0.8);
      doc.restore();
      doc.fillColor('#92400e').fontSize(7).font('Helvetica-Bold');
      const ls = s.split('\n'), lh2 = 9;
      let sy2 = y + (dh - ls.length * lh2) / 2 + lh2 * 0.6;
      ls.forEach(l => { doc.text(l, sx + (bw - dw) / 2 + 3, sy2, { width: dw - 6, align: 'center', lineGap: 0 }); sy2 += lh2; });
    } else {
      flowBox(s, sx, y, bw, bh, s.toLowerCase().startsWith('start') || s.toLowerCase().startsWith('end') ? '#dbeafe' : '#eff6ff');
    }
    if (i < steps.length - 1) flowArrow(sx + bw / 2, y + bh, sx + bw / 2, y + bh + gap);
    y += bh + gap;
  });
  doc.moveDown(total / doc.currentLineHeight() + 0.4);
}

function fileRef(path, desc) {
  need(15); doc.fontSize(8).fillColor(BLUE).font('Courier').text(`  ${path}`);
  doc.font('Helvetica').fontSize(8).fillColor('#64748b').text(`     ${desc}`, M + 10, doc.y - 1); doc.moveDown(0.2);
}

function codeBlock(lines) {
  const lh = 11, h = lines.length * lh + 10; need(h + 8);
  const y0 = doc.y; doc.rect(M, y0, W, h).fill('#f1f5f9');
  doc.fillColor('#1e293b').fontSize(8);
  lines.forEach((l, i) => doc.text(`  ${l}`, M + 4, y0 + 4 + i * lh));
  doc.moveDown(h / doc.currentLineHeight() + 0.3);
}

// ═══════════════════════════════ COVER ═══════════════════════════════
pg = 1;
doc.rect(0, 0, PW, PH).fill(DARK);
doc.rect(0, 0, PW, 8).fill(BLUE); doc.rect(0, PH - 8, PW, 8).fill(BLUE);
doc.fillColor('#fff').fontSize(36).font('Helvetica-Bold').text('POS System', M, 200, { align: 'center', width: W });
doc.fillColor(LIGHT).fontSize(20).font('Helvetica').text('Technical Documentation', { align: 'center', width: W });
doc.moveDown(1.5);
doc.fontSize(11).fillColor('#64748b').font('Helvetica').text('Architecture & Implementation Guide', { align: 'center', width: W });
doc.text(`Version ${VER}  |  ${DATE}`, { align: 'center', width: W });
doc.moveDown(1);
doc.fontSize(9).fillColor('#475569').text('Prepared by: POS System Engineering Team', { align: 'center', width: W });
doc.text('Prepared for: Development, DevOps & Technical Teams', { align: 'center', width: W });
doc.moveDown(1);
doc.fontSize(8).fillColor('#dc2626').font('Helvetica-Bold').text('CONFIDENTIAL', { align: 'center', width: W });
doc.fontSize(7.5).fillColor('#64748b').font('Helvetica').text('This document contains proprietary technical information. Do not distribute without authorization.', { align: 'center', width: W });
doc.fontSize(7).fillColor('#475569').text(`Page ${pg}`, M, PH - 18, { align: 'center', width: W });

// ═══════════════════════════════ TOC ═══════════════════════════════
np();
h1('Table of Contents');
const toc = ['Executive Summary','System Architecture','1. Project Overview','2. Directory Structure','3. Backend Architecture (3.1\u20133.6)','4. Frontend Architecture (4.1\u20134.6)','5. Data Flow','6. API Documentation','7. Role-Based Access Control','8. Security Architecture','9. Error Handling','10. Integrations','11. Reporting & Analytics','12. Deployment & DevOps','13. Key Libraries','Glossary','Appendix'];
toc.forEach(item => { doc.fontSize(10.5).fillColor(BLUE).font('Helvetica-Bold').text(item, { indent: 10 }); doc.moveDown(0.28); });

// ═══════════════════════════════ EXECUTIVE SUMMARY ═══════════════════════════════
np();
h1('Executive Summary');

h2('Product Overview');
p('The POS System is a full-stack restaurant management platform comprising two independently deployable services: a React 18 SPA (frontend) and a Node.js/Express REST API (backend). The backend uses Prisma ORM against PostgreSQL with JWT-based authentication. The system is containerised via Docker, deployed on Railway, and uses GitHub Actions for CI/CD. Real-time updates are delivered through Socket.IO.');

h2('Key Technical Capabilities');
drawTable(['Capability', 'Implementation', 'Benefit'], [
  ['Stateless Auth', 'JWT with 7-day expiry', 'Horizontal scalability, no session store'],
  ['Type-Safe DB Access', 'Prisma ORM', 'Compile-time query validation, auto-generated types'],
  ['Real-Time Updates', 'Socket.IO WebSockets', 'Instant order status push to all clients'],
  ['Role-Based Security', 'Multi-layer middleware', 'Frontend UI + Backend API enforcement'],
  ['Modular Architecture', 'Layered Express design', 'Maintainable, testable, extensible codebase'],
  ['Containerised Deploy', 'Docker + Railway', 'Consistent environments, automated CI/CD'],
], [140, 160, W - 310]);

h2('System Architecture Overview');
p('The system follows a three-tier architecture: Presentation (React SPA), Application (Express API with middleware, controllers, and Prisma), and Data (PostgreSQL). Communication uses HTTPS/JSON with WebSocket fallback for real-time features. External integrations include payment gateways, Twilio SMS, and Nodemailer for email.');

flowChart('Architecture Flow', ['User Browser\n(React SPA)', 'HTTPS / JSON\nAPI Requests', 'Express Middleware\n(Auth + Roles)', 'Controller Layer\n(Business Logic)', 'Prisma ORM\n(Data Access)', 'PostgreSQL\n(Database)']);

// ═══════════════════════════════ 1. PROJECT OVERVIEW ═══════════════════════════════
np();
h1('1. Project Overview');

h2('Architecture Overview');
p('The POS System is a full-stack restaurant management platform comprising two independently deployable services: a React 18 single-page application (frontend) and a Node.js/Express REST API (backend). The frontend handles all user interface rendering and client-side routing, while the backend manages business logic, data persistence, authentication, and authorization. Communication occurs over HTTPS with JSON payloads, supplemented by Socket.IO for real-time bidirectional updates.');
p('The backend uses Prisma ORM for type-safe database access against a PostgreSQL database. Authentication is JWT-based using the jsonwebtoken library, with passwords hashed via bcryptjs. The system is containerised using Docker and deployed on Railway, with a GitHub Actions CI/CD pipeline that automatically builds and deploys both services on every push to the pos-system branch.');

drawTable(['Component', 'Technology', 'Port', 'URL'], [
  ['Frontend SPA', 'React 18 + Vite 5', '8080', 'https://fnb-mvp.up.railway.app'],
  ['Backend API', 'Node.js + Express', '8080', 'https://mvp-fnb.up.railway.app/api'],
  ['Database', 'PostgreSQL (Railway)', '5432', 'Managed by Railway'],
], [120, 140, 50, W - 320]);

// ═══════════════════════════════ 2. DIRECTORY STRUCTURE ═══════════════════════════════
np();
h1('2. Directory Structure');

h2('Repository Layout');
p('The repository follows a monorepo pattern with backend/ and frontend/ directories plus root-level configuration.');

fileRef('docker-compose.yml',           'Local development Docker orchestration');
fileRef('railway.json',                 'Railway deployment service definitions');
fileRef('.github/workflows/deploy.yml', 'CI/CD pipeline configuration');
fileRef('backend/src/server.js',        'Express entry point');
fileRef('backend/src/routes/',          '12 route files');
fileRef('backend/src/controllers/',     'Business logic handlers');
fileRef('backend/src/middleware/',       'auth.js, roles.js, errorHandler.js');
fileRef('backend/prisma/schema.prisma', 'Database schema (35+ models)');
fileRef('frontend/src/main.jsx',        'React DOM entry point');
fileRef('frontend/src/App.jsx',         'Root component with routes');
fileRef('frontend/src/pages/',          '13 page-level components');

// ═══════════════════════════════ 3. BACKEND ARCHITECTURE ═══════════════════════════════
np();
h1('3. Backend Architecture');

h2('Layered Architecture');
p('The backend follows a layered architecture: routes define the API surface, middleware handles cross-cutting concerns (auth, roles, errors), controllers contain business logic, and Prisma manages database access. This structure ensures maintainability, testability, and clear separation of concerns.');

flowChart('Request Processing Pipeline', ['HTTP Request\narrives', 'CORS & Body\nParser', 'authenticate\n(JWT verify)', 'authorize\n(role check)', 'Controller\n(business logic)', 'Prisma ORM\n(DB query)', 'JSON Response\nreturned']);

h2('3.1 Entry Point \u2014 server.js');
p('Bootstraps Express: loads env vars via dotenv, configures CORS + JSON body parser (15MB limit for base64 images) + cookie parser, mounts routes under /api, initializes Socket.IO, starts HTTP server on PORT (5000 local, 8080 Railway), registers global error handler.');

h2('3.2 Routes Layer');
fileRef('backend/src/routes/auth.routes.js',      'Authentication, user CRUD (role-gated)');
fileRef('backend/src/routes/module.routes.js',    'Module listing and override management');
fileRef('backend/src/routes/inventory.routes.js', '12-section inventory CRUD');
fileRef('backend/src/routes/order.routes.js',     'Order CRUD, status updates, code lookup');
fileRef('backend/src/routes/menu.routes.js',      'Menu CRUD with category filters');
fileRef('backend/src/routes/restaurant.routes.js','Restaurant CRUD by building');
fileRef('backend/src/routes/building.routes.js',  'Building CRUD');
fileRef('backend/src/routes/payment.routes.js',   'Payment processing');
fileRef('backend/src/routes/delivery.routes.js',  'Delivery confirmation');
fileRef('backend/src/routes/dashboard.routes.js', 'KPIs, charts, reports');
fileRef('backend/src/routes/food-card.routes.js', 'Food card management');

h2('3.3 Controllers Layer');
p('Business logic in backend/src/controllers/. Each controller validates inputs, enforces rules, interacts with Prisma, emits Socket.IO events where applicable, and returns JSON. Key controllers: auth (login, register, user CRUD with hierarchy enforcement), module (three-tier override resolution), inventory (auto-deduction hook on order completion), order (status management), menu (food category, base64 image handling).');

h2('3.4 Middleware');
p('authenticate: Extracts JWT from Authorization header, verifies via jsonwebtoken, attaches { id, role, isSuperadmin, buildingId, restaurantId } to req.user. Returns 401 if invalid. authorize: Checks req.user.role against allowed roles. SuperAdmin always passes. errorHandler: Catches unhandled errors, returns consistent 500 JSON response.');

h2('3.5 Database Schema (Prisma)');
p('35+ models in backend/prisma/schema.prisma. Key model groups:');

drawTable(['Model', 'Purpose', 'Primary Key', 'Related Tables'], [
  ['User', 'System user accounts', 'id (PK)', 'Building, Restaurant'],
  ['Building', 'Physical locations', 'id (PK)', 'Restaurant, User'],
  ['Restaurant', 'Operational outlets', 'id (PK)', 'Building, Menu, Order, User'],
  ['Order', 'Customer orders', 'id (PK)', 'Restaurant, OrderItem'],
  ['OrderItem', 'Line items per order', 'id (PK)', 'Order, MenuItem'],
  ['InventoryItem', 'Stock items', 'id (PK)', 'InventoryCategory, InventoryStock'],
  ['InventoryStock', 'Current stock levels', 'id (PK)', 'InventoryItem'],
  ['RecipeMapping', 'Menu-to-ingredient links', 'id (PK)', 'MenuItem, RecipeIngredient'],
  ['Module', 'System modules', 'id (PK)', 'UserModule, RestaurantModule, BuildingModule'],
], [110, 130, 80, W - 330]);

h2('3.6 Authentication & JWT Flow');
p('JWT-based stateless authentication. Payload: { id, role, isSuperadmin, buildingId, restaurantId }. Token expires in 7 days. Every request includes Authorization: Bearer <token>. authenticate() middleware decodes and verifies on each request.');

codeBlock(['function generateToken(user) {', '  return jwt.sign({ id: user.id, role: user.role,', '    isSuperadmin: user.isSuperadmin,', '    buildingId: user.buildingId, restaurantId: user.restaurantId', '  }, JWT_SECRET, { expiresIn: "7d" });', '}']);

// ═══════════════════════════════ 4. FRONTEND ARCHITECTURE ═══════════════════════════════
np();
h1('4. Frontend Architecture');

h2('Component Hierarchy');
p('React 18 SPA built with Vite 5 and Tailwind CSS 3. Component structure: AuthProvider > SocketProvider > React Router Routes. Lazy-loaded pages for code splitting. Dual filtering of sidebar links by role (SIDEBAR_LINKS[role]) and enabled modules (allowedModules).');

codeBlock(['<AuthProvider>', '  <SocketProvider>', '    <Routes>', '      <Route path="/login" element={<Login />} />', '      <Route element={<ProtectedRoute />}>', '        <Route element={<Layout />}>', '          ... lazy-loaded page routes', '        </Route>', '      </Route>', '    </Routes>', '  </SocketProvider>', '</AuthProvider>']);

h2('Key Components');
p('Pages (13): Login, Dashboard, Orders, Menu, Inventory, Users, Buildings, Restaurants, ModuleManagement, DeliveryConfirmation, Checkout, OrderSuccess, Register. UI Primitives: Button, Modal, Input, Table, Badge, Card, PageHeader. Layout: Layout, TopBar, Sidebar, BottomNav, ProtectedRoute. Context: AuthContext (auth state, login/logout/switchRole), SocketContext (Socket.IO client). API Layer: Axios client with JWT interceptor + 401 handler, grouped endpoint methods.');

// ═══════════════════════════════ 5. DATA FLOW ═══════════════════════════════
np();
h1('5. Data Flow');

h2('5.1 Login Sequence');
flowChart('Login Flow', ['User enters\ncredentials', 'POST /api/auth/login', 'bcrypt.compare\nvalidates', 'Valid credentials?', 'JWT generated\nand returned', 'Token stored in\nlocalStorage', 'GET /api/modules/\nmy-access', 'allowedModules\nloaded', 'Dashboard renders\nper role']);

h2('5.2 Order Lifecycle');
p('Orders flow: PENDING_PAYMENT -> PAID -> PREPARING -> COMPLETED -> DELIVERED. On COMPLETED, the system queries RecipeMapping and deducts ingredient quantities from InventoryStock, creating an InventoryMovement audit record. Socket.IO broadcasts all status changes.');

flowChart('Order Lifecycle', ['Order placed\n(PENDING_PAYMENT)', 'Payment processed\n(PAID)', 'Kitchen prep\n(PREPARING)', 'Ready for service\n(COMPLETED)', 'Check Recipe\nMapping', 'Mapping\nexists?', 'Deduct ingredient\nquantities', 'Create Movement\naudit record', 'Hand to customer\n(DELIVERED)']);

h2('5.3 Module Access Resolution');
p('Three-tier override: User-level > Restaurant-level > Building-level > Default (all enabled). Super Admin bypasses all.');

codeBlock(['const result = allModules.filter(mod => {', '  if (mod.id in userOverrideMap) return userOverrideMap[mod.id];', '  if (mod.id in restaurantOverrideMap) return restaurantOverrideMap[mod.id];', '  if (mod.id in buildingOverrideMap) return buildingOverrideMap[mod.id];', '  return true;', '});']);

// ═══════════════════════════════ 6. API DOCUMENTATION ═══════════════════════════════
np();
h1('6. API Documentation');

h2('Authentication Endpoints');
drawTable(['Endpoint', 'Method', 'Auth', 'Description'], [
  ['/api/auth/login', 'POST', 'No', 'Authenticate user, returns JWT token'],
  ['/api/auth/register', 'POST', 'No', 'Register new customer account'],
  ['/api/auth/profile', 'GET', 'Yes', 'Get authenticated user profile'],
  ['/api/auth/switch-role', 'POST', 'Yes', 'Switch active role (Super Admin only)'],
  ['/api/auth/users', 'GET/POST', 'Yes', 'List or create users (role-gated)'],
], [170, 60, 40, W - 280]);

h3('Login \u2014 Sample Request/Response');
codeBlock(['POST /api/auth/login', 'Request: { "username": "restmgr1", "password": "restmgr123" }', 'Response: { "token": "<JWT>", "user": { "id": 2, "username": "restmgr1",', '  "role": "RESTAURANT_MANAGER", "isSuperadmin": false } }', 'Error: 401 { "message": "Invalid credentials" }']);

h2('Order Endpoints');
drawTable(['Endpoint', 'Method', 'Auth', 'Description'], [
  ['/api/orders', 'GET', 'Yes', 'List orders (filtered by scope)'],
  ['/api/orders', 'POST', 'Yes', 'Create new order'],
  ['/api/orders/:id', 'GET', 'Yes', 'Get order details'],
  ['/api/orders/:id/status', 'PATCH', 'Yes', 'Update order status'],
  ['/api/orders/code/:code', 'GET', 'Yes', 'Lookup order by order code'],
], [180, 60, 40, W - 290]);

h2('Module & Inventory Endpoints');
drawTable(['Endpoint', 'Method', 'Description'], [
  ['/api/modules/my-access', 'GET', 'Get user\'s accessible modules'],
  ['/api/modules/overrides', 'GET/POST/DELETE', 'Manage module overrides'],
  ['/api/inventory/items', 'GET/POST/PATCH/DELETE', 'Manage inventory items'],
  ['/api/inventory/purchase-orders', 'GET/POST/PATCH', 'Purchase order management'],
  ['/api/inventory/goods-receipts', 'GET/POST', 'Goods receipt processing'],
  ['/api/inventory/transfers', 'GET/POST/PATCH', 'Stock transfer management'],
  ['/api/inventory/recipe-mappings', 'GET/POST/PATCH/DELETE', 'Recipe mapping CRUD'],
], [200, 100, W - 310]);

// ═══════════════════════════════ 7. RBAC ═══════════════════════════════
np();
h1('7. Role-Based Access Control');

h2('Access Control Matrix');
p('SA = Super Admin, BM = Building Manager, RM = Restaurant Manager, CF = Chef, CU = Customer.');
drawTable(['Feature', 'SA', 'BM', 'RM', 'CF', 'CU'], [
  ['Dashboard', 'Y', 'Y', 'Y', 'Y', 'Y'],
  ['Order Management', 'Y*', 'Y*', 'Y', 'Y', 'Y**'],
  ['Menu Management', 'Y', 'R', 'Y', 'R', 'B'],
  ['Inventory Management', 'Y', 'Y', 'Y', 'L', 'N'],
  ['User Management', 'Y', 'Y', 'Y', 'N', 'N'],
  ['Building Management', 'Y', 'Y', 'R', 'N', 'N'],
  ['Restaurant Management', 'Y', 'Y', 'Y', 'R', 'R'],
  ['Delivery Confirmation', 'Y*', 'Y*', 'Y', 'Y', 'N'],
  ['Module Management', 'Y', 'N', 'N', 'N', 'N'],
  ['QR Code Scanner', 'N', 'N', 'Y', 'Y', 'N'],
], [130, 22, 22, 22, 22, W - 240]);
doc.fontSize(7.5).fillColor('#64748b').text('Y=Full, Y*=Read-only, R=Read, B=Browse, L=Limited, N=No Access', { indent: 10 }); doc.moveDown(0.3);

h2('Enforcement Rules');
li('Users can only manage accounts with roles strictly below their own level.');
li('BM scoped to assigned building; RM scoped to assigned restaurant.');
li('Super Admin bypasses all role-level and scope-level restrictions.');
li('Self-deletion is prevented at the API level.');
li('Enforcement at both frontend (UI visibility) and backend (API middleware) layers.');

// ═══════════════════════════════ 8. SECURITY ═══════════════════════════════
np();
h1('8. Security Architecture');

h2('Authentication Mechanism');
p('The system uses JWT-based stateless authentication. Upon successful login with valid credentials, the backend generates a signed JWT containing the user\'s identity and role information. The token is stored client-side in localStorage and included in the Authorization header of every API request. The backend verifies the token on each request using the authenticate middleware, which decodes the JWT and populates the req.user object.');

h2('Authorization Model');
p('Role-Based Access Control (RBAC) is enforced at every API endpoint through the authorize middleware. Each route specifies which roles are permitted, and Super Admin is always allowed. Data scoping is additionally enforced: Building Managers see only their building\'s data, and Restaurant Managers see only their restaurant\'s data.');

h2('Password Policies');
li('Passwords are hashed using bcryptjs with salt rounds before storage.');
li('Plain-text passwords are never stored or logged.');
li('Minimum password length is enforced at account creation.');

h2('Session & Token Management');
li('JWT tokens expire after 7 days from issuance.');
li('Tokens are self-contained; no server-side session store is required.');
li('No refresh token mechanism; re-authentication is required after expiry.');
li('The response interceptor in the Axios client automatically handles 401 responses by clearing localStorage and redirecting to the login page.');

h2('Audit Trail');
li('All stock changes create InventoryMovement records for complete traceability.');
li('Order status changes are logged with timestamps and user context.');
li('User management actions (create, edit, delete) are performed by authenticated users with role hierarchy enforcement.');

h2('Data Encryption');
li('Data in transit: HTTPS/TLS for all HTTP communication between frontend and backend.');
li('Data at rest: PostgreSQL database encryption is managed by the hosting provider (Railway).');
li('Passwords: bcrypt hashing with salt for storage security.');

// ═══════════════════════════════ 9. ERROR HANDLING ═══════════════════════════════
np();
h1('9. Error Handling');

h2('Error Response Format');
p('All API errors follow a consistent JSON structure: { "message": "Human-readable description", "error": "Technical details (development only)" }.');

drawTable(['Error Type', 'HTTP Status', 'Description', 'Example Cause'], [
  ['Validation Error', '400', 'Invalid request payload', 'Missing required field, invalid format'],
  ['Authentication Error', '401', 'Missing or invalid JWT', 'Token expired, invalid signature'],
  ['Authorization Error', '403', 'Insufficient role permissions', 'User role not permitted for endpoint'],
  ['Not Found', '404', 'Resource does not exist', 'Invalid order code, unknown user ID'],
  ['Conflict', '409', 'Resource state conflict', 'Duplicate username, invalid status transition'],
  ['Server Error', '500', 'Unhandled exception', 'Database failure, null pointer'],
], [130, 90, 140, W - 370]);

h2('Error Handling Strategy');
p('The global errorHandler middleware catches all unhandled exceptions. In development, the full stack trace is returned. In production, only a generic message is returned to avoid exposing internal details. Prisma errors are mapped to appropriate HTTP status codes. The frontend response interceptor handles 401 by clearing auth state and redirecting to /login. All other errors are surfaced via react-hot-toast notifications.');

// ═══════════════════════════════ 10. INTEGRATIONS ═══════════════════════════════
np();
h1('10. Integrations');

drawTable(['Integration', 'Technology', 'Purpose', 'Configuration'], [
  ['Payment Gateway', 'Custom endpoint', 'Process order payments', 'POST /api/payment/pay controller'],
  ['SMS Service', 'Twilio ^4', 'Send OTP via SMS', 'TWILIO_* env variables'],
  ['Email Service', 'Nodemailer ^6', 'Send OTP and notifications', 'SMTP configuration in env'],
  ['QR Generation', 'qrcode.react ^4', 'Generate order QR codes', 'Frontend library, no config'],
  ['QR Scanning', 'html5-qrcode ^2.3', 'Camera-based QR reading', 'Browser camera permission'],
  ['Real-Time', 'Socket.IO ^4', 'Push order status updates', 'Same backend port'],
  ['Auth', 'jsonwebtoken ^9 + bcryptjs ^2.4', 'JWT auth + password hashing', 'JWT_SECRET env variable'],
], [110, 140, 130, W - 390]);

// ═══════════════════════════════ 11. REPORTING & ANALYTICS ═══════════════════════════════
np();
h1('11. Reporting & Analytics');

h2('Dashboard Reports');
drawTable(['Report', 'Data Source', 'Available Filters', 'User Roles'], [
  ['Order KPIs', 'Order table', 'Date range, restaurant', 'All roles'],
  ['Revenue Summary', 'Order + OrderItem', 'Date range, building', 'RM, BM, SA'],
  ['Order Status Distribution', 'Order status enum', 'Restaurant, date', 'RM, BM, SA'],
  ['Low Stock Alerts', 'InventoryStock', 'Restaurant, category', 'RM, BM, SA'],
  ['Super Admin Overview', 'All tables', 'Building, date range', 'SA only'],
], [150, 120, 140, W - 420]);

h2('Export Options');
p('Dashboard data is viewable within the application interface. Future enhancements will include CSV/Excel export capabilities and scheduled report delivery.');

// ═══════════════════════════════ 12. DEPLOYMENT ═══════════════════════════════
np();
h1('12. Deployment & DevOps');

h2('CI/CD Pipeline');
p('Push to pos-system branch triggers GitHub Actions workflow: build Docker images for backend and frontend, push to Railway registry, trigger rolling deployment.');

flowChart('Deployment Pipeline', ['Push to\npos-system branch', 'GitHub Actions\nworkflow starts', 'Backend Docker\nimage build', 'Frontend Docker\nimage build', 'Push to Railway\nregistry', 'Railway deploys\nbackend', 'Railway deploys\nfrontend', 'Deployment\nsuccessful']);

h2('Environment Variables');
h3('Backend');
codeBlock(['JWT_SECRET=pos-system-jwt-secret-2024', 'CLIENT_URL=https://fnb-mvp.up.railway.app']);
h3('Frontend');
codeBlock(['VITE_API_URL=https://mvp-fnb.up.railway.app/api', 'VITE_SOCKET_URL=https://mvp-fnb.up.railway.app']);

h2('Rollback Procedure');
li('Navigate to Railway dashboard for the affected service.');
li('Open the Deployments tab and identify the last known working deployment.');
li('Click "Redeploy" on that deployment to restore the previous version.');

// ═══════════════════════════════ 13. KEY LIBRARIES ═══════════════════════════════
np();
h1('13. Key Libraries & Versions');

h2('Backend');
drawTable(['Library', 'Version', 'Purpose'], [
  ['express', '^4.18', 'HTTP server framework'],
  ['@prisma/client', '^5', 'Type-safe PostgreSQL ORM'],
  ['jsonwebtoken', '^9', 'JWT generation and verification'],
  ['bcryptjs', '^2.4', 'Password hashing'],
  ['socket.io', '^4', 'Real-time WebSocket server'],
  ['cors', '^2.8', 'Cross-Origin Resource Sharing'],
  ['dotenv', '^16', 'Environment variable loading'],
  ['nodemailer', '^6', 'Email sending (OTP)'],
  ['twilio', '^4', 'SMS sending (OTP)'],
], [140, 60, W - 210]);

h2('Frontend');
drawTable(['Library', 'Version', 'Purpose'], [
  ['react / react-dom', '^18', 'UI library'],
  ['react-router-dom', '^6', 'Client-side routing'],
  ['vite', '^5', 'Build tool and dev server'],
  ['tailwindcss', '^3', 'Utility-first CSS framework'],
  ['axios', '^1', 'HTTP client with interceptors'],
  ['socket.io-client', '^4', 'WebSocket client'],
  ['html5-qrcode', '^2.3', 'QR code scanner'],
  ['qrcode.react', '^4', 'QR code generation'],
], [140, 60, W - 210]);

h2('Dev Dependencies');
drawTable(['Library', 'Version', 'Purpose'], [
  ['prisma', '^5', 'Schema management and migrations'],
  ['nodemon', '^3', 'Auto-restart during development'],
  ['@vitejs/plugin-react', '^4', 'Vite React plugin'],
], [140, 60, W - 210]);

// ═══════════════════════════════ GLOSSARY ═══════════════════════════════
np();
h1('Glossary');
drawTable(['Term', 'Definition'], [
  ['API', 'Application Programming Interface \u2014 a set of protocols for building and integrating applications'],
  ['CRUD', 'Create, Read, Update, Delete \u2014 four basic operations of persistent storage'],
  ['ERD', 'Entity-Relationship Diagram \u2014 visual representation of database tables and relationships'],
  ['GRN', 'Goods Receipt Note \u2014 document acknowledging receipt of goods from a vendor'],
  ['JWT', 'JSON Web Token \u2014 compact, URL-safe token format for authentication'],
  ['KDS', 'Kitchen Display System \u2014 digital display showing orders to kitchen staff'],
  ['KPI', 'Key Performance Indicator \u2014 measurable value showing how effectively objectives are achieved'],
  ['ORM', 'Object-Relational Mapping \u2014 technique for converting data between type systems'],
  ['PO', 'Purchase Order \u2014 commercial document issued by a buyer to a seller'],
  ['POS', 'Point of Sale \u2014 place where a retail transaction is completed'],
  ['RBAC', 'Role-Based Access Control \u2014 restricting system access to authorised users'],
  ['SIT', 'System Integration Testing \u2014 testing phase verifying system component interactions'],
  ['SKU', 'Stock Keeping Unit \u2014 unique identifier for each product or item in inventory'],
  ['SPA', 'Single-Page Application \u2014 web app that loads one HTML page and dynamically updates'],
  ['UAT', 'User Acceptance Testing \u2014 final testing phase before deployment'],
], [60, W - 70]);

// ═══════════════════════════════ APPENDIX ═══════════════════════════════
np();
h1('Appendix');

h2('Version History');
drawTable(['Version', 'Date', 'Author', 'Changes'], [['1.0', 'June 2026', 'Engineering Team', 'Initial release']], [60, 80, 120, W - 270]);

h2('Known Limitations');
li('The dashboard does not auto-refresh; manual reload is required for updated KPIs.');
li('QR scanning requires an active camera and may not function on all mobile browsers.');
li('The system currently supports Indian Rupees (INR) as the sole currency.');

h2('Future Enhancements');
li('Real-time dashboard auto-refresh via WebSocket push updates.');
li('Multi-currency support for international deployments.');
li('Advanced analytics with predictive inventory and demand forecasting.');
li('Offline mode for order processing during network interruptions.');
li('Mobile native applications for iOS and Android platforms.');

h2('Support Contact');
p('For technical support, report issues at the project repository: https://github.com/PugazhendhiS-alt/FNB. For deployment or infrastructure issues, contact the platform operations team through the organisation\'s IT support portal.');

doc.moveDown(2);
doc.fontSize(8).fillColor(LIGHT).font('Helvetica').text('\u2014 End of Document \u2014', { align: 'center', width: W });
doc.end();
console.log('PDF generated: POS_System_Technical_Documentation.pdf');
