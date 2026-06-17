const PDFDocument = require('pdfkit');
const fs = require('fs');

const VER = '1.0', DATE = 'June 2026', COMPANY = 'FnB Platform';
const M = 55, PW = 595.28, PH = 841.89, W = PW - 2 * M, BL = 70;
const BLUE = '#1e40af', DARK = '#0f172a', GRAY = '#334155', LIGHT = '#94a3b8';

let pg = 0;

const doc = new PDFDocument({
  size: 'A4', margin: M,
  info: { Title: 'POS System User Guide', Author: COMPANY },
});
const out = fs.createWriteStream('POS_System_User_Guide.pdf');
doc.pipe(out);

function setupPage() {
  doc.fontSize(7).fillColor(LIGHT).font('Helvetica');
  doc.text('POS System', M, 12, { continued: true });
  doc.text('User Guide', M + 50, 12);
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
  const colors = { note: { bg: '#fefce8', border: '#facc15', title: '#92400e', text: '#78350f' }, tip: { bg: '#eff6ff', border: '#3b82f6', title: '#1e40af', text: '#1e3a8a' }, warn: { bg: '#fef2f2', border: '#ef4444', title: '#991b1b', text: '#7f1d1d' } };
  const c = colors[type] || colors.note;
  doc.rect(M, y0, W, 28).fill(c.bg); doc.rect(M, y0, W, 28).stroke(c.border).lineWidth(0.5);
  doc.fontSize(8).fillColor(c.title).font('Helvetica-Bold').text(type.toUpperCase() + ':', M + 6, y0 + 4);
  doc.font('Helvetica').fontSize(8.5).fillColor(c.text).text(text, M + (type === 'warn' ? 36 : 30), y0 + 4, { width: W - (type === 'warn' ? 42 : 36) });
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
  figNum++;
  const boxH = 70; need(boxH + 18);
  const y0 = doc.y;
  doc.rect(M, y0, W, boxH).fill('#f8fafc'); doc.rect(M, y0, W, boxH).stroke('#cbd5e1').lineWidth(0.5);
  doc.rect(M, y0, W, 15).fill(BLUE);
  doc.fillColor('#fff').fontSize(7.5).font('Helvetica-Bold').text(`Figure ${figNum} \u2013 ${name}`, M + 6, y0 + 3);
  doc.fillColor(GRAY).fontSize(7).font('Helvetica');
  let ey = y0 + 18;
  if (description) { doc.text(description, M + 8, ey, { width: W - 16 }); ey += 12; }
  if (elements) { elements.forEach(el => { doc.fillColor(BLUE).fontSize(7).text(`\u2022 ${el}`, M + 8, ey, { width: W - 16 }); ey += 9; }); }
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
  const bw = 125, bh = 24, gap = 8, total = steps.length * (bh + gap) - gap + 14;
  need(total + 20);
  const sx = M + W / 2 - bw / 2, sy = doc.y + 2;
  doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold').text(title || 'Process Flow', { indent: 5 }); doc.moveDown(0.15);
  let y = sy;
  steps.forEach((s, i) => {
    const isStart = s.toLowerCase().startsWith('start') || s.toLowerCase().startsWith('end');
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
      const fill = isStart ? '#dbeafe' : '#eff6ff';
      const tc = isStart ? '#1e40af' : '#1e3a5f';
      flowBox(s, sx, y, bw, bh, fill, tc);
    }
    if (i < steps.length - 1) flowArrow(sx + bw / 2, y + bh, sx + bw / 2, y + bh + gap);
    y += bh + gap;
  });
  doc.moveDown(total / doc.currentLineHeight() + 0.4);
}

// ═══════════════════════════════ COVER ═══════════════════════════════
pg = 1;
doc.rect(0, 0, PW, PH).fill(DARK);
doc.rect(0, 0, PW, 8).fill(BLUE); doc.rect(0, PH - 8, PW, 8).fill(BLUE);
doc.fillColor('#fff').fontSize(38).font('Helvetica-Bold').text('POS System', M, 200, { align: 'center', width: W });
doc.fillColor(LIGHT).fontSize(22).font('Helvetica').text('User Guide', { align: 'center', width: W });
doc.moveDown(1.5);
doc.fontSize(11).fillColor('#64748b').font('Helvetica').text('Restaurant Management Platform', { align: 'center', width: W });
doc.text(`Version ${VER}  |  ${DATE}`, { align: 'center', width: W });
doc.moveDown(1);
doc.fontSize(9).fillColor('#475569').text('Prepared by: POS System Documentation Team', { align: 'center', width: W });
doc.text('Prepared for: FnB Platform Stakeholders & User Community', { align: 'center', width: W });
doc.moveDown(1);
doc.fontSize(8).fillColor('#dc2626').font('Helvetica-Bold').text('CONFIDENTIAL', { align: 'center', width: W });
doc.fontSize(7.5).fillColor('#64748b').font('Helvetica').text('This document contains proprietary information. Do not distribute without authorization.', { align: 'center', width: W });
doc.fontSize(7).fillColor('#475569').text(`Page ${pg}`, M, PH - 18, { align: 'center', width: W });

// ═══════════════════════════════ TOC ═══════════════════════════════
np();
h1('Table of Contents');
const tocEntries = [
  'Executive Summary','System Architecture','User Journey Maps',
  '1.  System Overview','2.  Accessing the System','3.  Demo Credentials',
  '4.  User Roles & Permissions','5.  Navigation & Layout','6.  Dashboard',
  '7.  Profile Management','8.  Notification System',
  '9.  Order Management','10. Menu Management','11. Inventory Management',
  '12. Restaurant & Building Management','13. User Management',
  '14. Module Access Control','15. QR Code Scanner','16. Delivery Confirmation',
  '17. Module Management (Super Admin)','Glossary','Appendix'];
tocEntries.forEach(item => { doc.fontSize(10.5).fillColor(BLUE).font('Helvetica-Bold').text(item, { indent: 10 }); doc.moveDown(0.28); });

// ═══════════════════════════════ EXECUTIVE SUMMARY ═══════════════════════════════
np();
h1('Executive Summary');

h2('Product Overview');
p('The POS System is an enterprise-grade restaurant management platform designed for multi-location food and beverage operations in the Indian market. It provides end-to-end digital management of restaurant operations including menu display, order processing, inventory tracking, user administration, and delivery confirmation. The platform is built on a modern, scalable architecture using React, Node.js, and PostgreSQL, and is accessible from any modern web browser without software installation.');

h2('Key Capabilities');
drawTable(
  ['Capability', 'Description', 'Business Impact'],
  [
    ['Multi-Location Management', 'Manage restaurants across buildings', 'Centralised control, consistent brand experience'],
    ['Real-Time Order Processing', 'End-to-end order lifecycle with live updates', 'Faster service, reduced errors'],
    ['Inventory Automation', 'Auto-deduction on order completion', 'Accurate stock levels, reduced waste'],
    ['Role-Based Security', '5-tier access control hierarchy', 'Data security, regulatory compliance'],
    ['QR Code Integration', 'Camera-based order lookup and delivery', 'Instant identification, zero typing errors'],
    ['Comprehensive Reporting', 'Real-time KPIs and analytics dashboards', 'Data-driven decision making'],
  ],
  [150, 200, W - 360]
);

h2('Supported User Roles');
drawTable(
  ['Role', 'Level', 'Scope', 'Primary Responsibilities'],
  [
    ['Super Admin', '100', 'System-wide', 'Configuration, user management, module control'],
    ['Building Manager', '70', 'Assigned building', 'Building oversight, restaurant management'],
    ['Restaurant Manager', '50', 'Assigned restaurant', 'Daily operations, orders, inventory, staff'],
    ['Chef', '40', 'Assigned restaurant', 'Order preparation, inventory checks, wastage'],
    ['Customer', '10', 'Self', 'Menu browsing, ordering, order history'],
  ],
  [120, 50, 110, W - 290]
);

h2('Business Benefits');
p('The POS System delivers measurable operational improvements: elimination of manual order errors through digital workflows, reduction of stock wastage via automated inventory tracking, faster customer service through QR-based identification, improved staff productivity with role-optimised interfaces, and enhanced management visibility through real-time dashboards and reports.');

// ═══════════════════════════════ SYSTEM ARCHITECTURE ═══════════════════════════════
np();
h1('System Architecture');

h2('High-Level Architecture');
p('The POS System follows a three-tier web architecture comprising a presentation layer (React SPA), an application layer (Node.js/Express API), and a data layer (PostgreSQL). The frontend communicates with the backend over HTTPS with JSON payloads, while real-time updates are delivered through Socket.IO WebSocket connections. All services are containerised using Docker and deployed on Railway with automated CI/CD via GitHub Actions.');

flowChart('System Architecture Flow', [
  'User (Browser)\nWeb Interface',
  'Frontend (React)\nSPA + Client Logic',
  'Backend API (Express)\nBusiness Logic + Auth',
  'Database (PostgreSQL)\nData Persistence',
  'Third-Party Services\nPayment, SMS, Email',
]);
p('The frontend layer renders the user interface, handles client-side routing, and manages local state. The backend layer processes all business logic, enforces security rules, and orchestrates data operations. The database layer stores all transactional and master data. Third-party integrations handle payment processing, SMS notifications, and email communications.');

h2('User Journey Maps');
p('The following journey maps illustrate how different roles interact with the system during a typical work session. These maps help new users understand the application flow quickly.');

h3('Restaurant Manager Journey');
flowChart('Manager Daily Workflow', [
  'Start: Login\nEnter credentials',
  'Dashboard\nView KPIs & alerts',
  'Check Orders\nReview pending orders',
  'Manage Menu\nUpdate items & pricing',
  'Review Inventory\nCheck stock levels',
  'End: Logout\nSecure exit',
]);

h3('Chef Journey');
flowChart('Chef Kitchen Workflow', [
  'Start: Login\nEnter credentials',
  'Dashboard\nView order queue',
  'Process Orders\nUpdate statuses',
  'Check Inventory\nView ingredient stock',
  'Log Wastage\nRecord spoiled items',
  'End: Logout\nSecure exit',
]);

h3('Administrator Journey');
flowChart('Admin Configuration Workflow', [
  'Start: Login\nSuper Admin credentials',
  'Dashboard\nOrganisation overview',
  'Manage Users\nCreate/edit accounts',
  'Configure Modules\nSet access permissions',
  'Review Reports\nAnalyse performance',
  'End: Logout\nSecure exit',
]);

// ═══════════════════════════════ 1. SYSTEM OVERVIEW ═══════════════════════════════
np();
h1('1. System Overview');

h2('Overview');
p('The POS System is a comprehensive restaurant management platform purpose-built for the Indian food and beverage market. It serves as the central operating system for multi-location restaurant chains, integrating menu management, order processing, inventory tracking, user administration, and delivery confirmation into a single unified platform. The system bridges the gap between front-of-house operations and back-of-house management, enabling seamless data flow across all functional areas.');
p('Built on a modern technology stack \u2014 React 18 on the frontend with Node.js, Express, and PostgreSQL on the backend \u2014 the system delivers a responsive, real-time experience accessible from any modern web browser. It supports complex organisational hierarchies where multiple restaurant outlets operate within larger building complexes, with role-based security ensuring that each user sees only the data and features appropriate to their responsibilities.');

drawTable(
  ['Capability', 'Description', 'Business Benefit'],
  [
    ['Multi-Location Support', 'Manage outlets across buildings', 'Centralised control, consistent operations'],
    ['Role-Based Security', '5-tier access hierarchy', 'Data security, operational compliance'],
    ['Real-Time Updates', 'Socket.IO push notifications', 'Immediate visibility, faster response'],
    ['Inventory Automation', 'Auto-deduction on order completion', 'Accurate stock, reduced waste'],
    ['QR Integration', 'Camera-based order lookup', 'Faster service, fewer errors'],
    ['Web-Based Access', 'No installation required', 'Lower IT overhead, device flexibility'],
  ],
  [120, 180, W - 310]
);

h2('Technology Stack');
drawTable(
  ['Layer', 'Technology', 'Purpose'],
  [
    ['Frontend', 'React 18, Vite 5, Tailwind CSS 3', 'User interface and client-side logic'],
    ['Backend', 'Node.js, Express, Prisma ORM', 'API server and business logic'],
    ['Database', 'PostgreSQL', 'Data persistence and transactions'],
    ['Real-Time', 'Socket.IO', 'Live order status updates'],
    ['Authentication', 'JWT + bcrypt', 'Stateless authentication'],
    ['Deployment', 'Railway, Docker, GitHub Actions', 'Hosting and CI/CD pipeline'],
  ],
  [110, 180, W - 300]
);

// ═══════════════════════════════ 2. ACCESSING THE SYSTEM ═══════════════════════════════
np();
h1('2. Accessing the System');

h2('Overview');
p('The POS System is entirely web-based and requires no software installation. Users access the platform through any modern web browser on desktop computers, laptops, tablets, or mobile phones. The login process authenticates the user, determines their role-based permissions, and loads a personalised dashboard tailored to their responsibilities within the organisation.');

h2('Business Objective');
p('Provide a secure, frictionless entry point for all users regardless of device or location, ensuring that the correct user gains access to the correct set of features based on their organisational role.');

h2('User Roles');
drawTable(['Role', 'Access Level', 'Actions Allowed'], [['All Registered Users', 'Full', 'Login, access permitted modules based on role']], [140, 100, W - 250]);

h2('Navigation Path');
p('Open a supported web browser. Navigate to: https://fnb-mvp.up.railway.app. Supported browsers: Chrome 90+, Edge 90+, Firefox 90+, Safari 15+.');

h2('Detailed Workflow');
p('When a user navigates to the frontend URL, the system serves the React single-page application. The login page renders with username and password fields. Upon submission, the frontend sends a POST request to /api/auth/login with the provided credentials. The backend retrieves the user record from PostgreSQL, compares the password against the stored bcrypt hash, and if validated, generates a JSON Web Token (JWT) containing the user\'s identity, role, building ID, and restaurant ID.');
p('The JWT is returned to the frontend and stored in the browser\'s localStorage. The frontend then immediately calls GET /api/modules/my-access to load the user\'s module permissions. Based on the returned allowed modules, the sidebar navigation is filtered, and the role-appropriate dashboard is rendered. The user can then navigate to any permitted module.');

screenshot('Login Screen', 'The login page is the single entry point for all system users.', ['Username and password input fields with validation', 'Login button with loading indicator', 'Error message display for invalid credentials']);

flowChart('Login Process', ['Start: User opens\nbrowser URL', 'Login page\ndisplays', 'Enter username\nand password', 'Credentials\nvalid?', 'JWT token\ngenerated', 'Module permissions\nloaded', 'Dashboard\nrenders per role', 'End: Ready for\noperations']);

h2('Example Scenario');
p('A newly hired Restaurant Manager on their first day opens Chrome, enters the frontend URL, and logs in with provided credentials. The system verifies their identity, loads their module permissions, and presents the manager dashboard. The sidebar shows permitted modules: Dashboard, Orders, Inventory, Menu, Users, and Delivery. The manager is ready to begin daily operations immediately.');

h2('Business Rules');
li('JWT tokens expire after 7 days, requiring re-authentication upon expiry.');
li('Passwords are stored as bcrypt hashes; plain-text passwords are never persisted.');
li('Session state is maintained in browser localStorage; clearing browser data logs the user out.');
li('The QR scanner feature requires browser camera permissions to be granted by the user.');
li('After multiple failed login attempts, a security delay is imposed to prevent brute force attacks.');

h2('Expected Outcome');
p('Upon successful authentication, the user is presented with a role-specific dashboard containing relevant KPIs, quick-action shortcuts, and a sidebar filtered to show only the modules they are permitted to access.');

// ═══════════════════════════════ 3-15. FEATURE MODULES ═══════════════════════════════
// (condensed format for remaining sections - keeping it concise but complete)

np();
h1('3. Demo Credentials');

h2('Overview');
p('The system includes pre-seeded demonstration accounts for all five user roles. These accounts are created automatically when the database seed script runs and come pre-configured with sample buildings, restaurants, menu items, orders, and inventory records. Demo accounts enable prospective clients, trainees, and implementation consultants to explore the full feature set without setting up production data.');

drawTable(['Role', 'Username', 'Password', 'Access Level'], [
  ['Super Admin', 'Superadmin', 'Admin12345', 'Full system access'],
  ['Building Manager', 'bldmgr1', 'bldmgr123', 'Building oversight'],
  ['Restaurant Manager', 'restmgr1', 'restmgr123', 'Outlet operations'],
  ['Chef', 'chef1', 'chef123', 'Order processing'],
  ['Customer', 'customer1', 'customer123', 'Menu browsing & ordering'],
], [130, 90, 90, W - 320]);
callout('warn', 'Demo accounts should never be used in production environments due to shared passwords. Production deployments must create unique credentials for each individual user.');

np();
h1('4. User Roles & Permissions');

h2('Overview');
p('The POS System implements a hierarchical role model with five distinct access levels. Each role inherits permissions from roles below it, and users can only manage accounts with roles strictly lower than their own. This structure mirrors typical restaurant organisational hierarchies and ensures appropriate access control at every level.');
p('Role enforcement happens at multiple layers: the frontend hides inaccessible UI elements, the sidebar filters navigation links, and the backend API independently verifies permissions on every request. This multi-layered approach ensures security even if a user attempts to directly navigate to a restricted URL.');

drawTable(['Role (Level)', 'Scope', 'Key Permissions'], [
  ['Super Admin (100)', 'Entire system', 'Full CRUD on all entities, module configuration, role switching'],
  ['Building Manager (70)', 'Assigned building', 'Manage restaurants, create RM/Chef/Customer users'],
  ['Restaurant Manager (50)', 'Assigned restaurant', 'Menu, orders, inventory, users (Chef/Customer)'],
  ['Chef (40)', 'Assigned restaurant', 'View/update orders, view inventory, log wastage'],
  ['Customer (10)', 'Self', 'Browse menus, place orders, view order history'],
], [150, 120, W - 280]);
callout('note', 'Super Admin bypasses all role-level checks and has unrestricted access across all buildings and restaurants. This is by design to enable system-wide administration.');

np();
h1('5. Navigation & Layout');

h2('Overview');
p('The user interface follows a consistent three-component layout: a Top Bar providing context and user controls, a Sidebar (desktop) or Bottom Navigation (mobile) listing available modules, and a main content area. Navigation links are dynamically filtered by the user\'s role and enabled modules.');

drawTable(['Component', 'Visibility', 'Function'], [
  ['Top Bar', 'All authenticated users', 'Logo, context display, notifications, theme toggle, profile'],
  ['Sidebar', 'Desktop screens', 'Role-filtered navigation links with active highlighting'],
  ['Bottom Navigation', 'Mobile screens', 'Up to 6 frequently used tabs, filtered by role'],
  ['Hamburger Menu', 'Mobile screens', 'Full module list overlay for less frequent features'],
], [130, 120, W - 260]);

np();
h1('6. Dashboard');

h2('Overview');
p('The Dashboard serves as the central command centre and default landing page after login. It provides an at-a-glance view of business performance through six KPI cards displaying real-time metrics for Total Users, Buildings, Restaurants, Orders, Revenue, and Pending Orders. Below the KPIs, a customisable widget system with three section rows \u2014 Business Insights, Operational Dashboard, and Management Overview \u2014 presents detailed analytics panels including revenue trends, order summaries, kitchen status, inventory levels, customer analytics, staff distribution, payment breakdowns, and real-time notifications.');
p('Unlike traditional static dashboards, this platform draws all widget data from live database queries, ensuring that every number, chart, and metric reflects the current state of operations. The KPI cards automatically fetch their values using the system\'s batch data API, while the section widgets query a dedicated section-data endpoint that aggregates sales, orders, kitchen, customer, staff, and payment information in a single request. Super Administrators see organisation-wide aggregates, while Building Managers and Restaurant Managers see data scoped to their assigned locations.');

drawTable(['Role', 'Data Scope', 'Additional Widgets'], [
  ['Super Admin', 'Organisation-wide', 'Building Reports, cross-location comparison'],
  ['Building Manager', 'Assigned building', 'Building-scoped KPIs and analytics'],
  ['Restaurant Manager', 'Assigned restaurant', 'Outlet-specific KPIs and operational panels'],
  ['Chef', 'Assigned restaurant', 'Order-focused KPIs, kitchen status panel'],
  ['Customer', 'Self', 'Personal order history and food card overview'],
], [150, 140, W - 300]);

flowChart('Dashboard Loading Sequence', ['Start: Login\nsuccessful', 'Fetch KPI data\nfrom widget API', 'Render KPI\ncards row', 'Fetch section data\nfrom dashboard API', 'Render Revenue,\nOrders, Kitchen...', 'Render Customers,\nStaff, Payments...', 'End: Dashboard\nready']);

h2('Key Capabilities');
p('The dashboard is organised into three distinct sections. The Business Insights row displays a revenue analysis panel with today\'s, weekly, monthly, and all-time revenue figures, each with trend indicators showing performance direction. Alongside it, an Orders Summary panel shows active orders, completed today, cancelled orders, and average order value. The Operational Dashboard row provides a Kitchen Status panel with counts for pending, in-preparation, ready-to-serve, and delivered-today orders; an Inventory panel visualises stock levels across categories; and a Customer Analytics panel displays total, active, new, and returning customer counts. The Management Overview row includes a real-time Notification feed, a Staff panel showing user role distribution, and a Payment breakdown panel.');
p('Each widget panel includes a refresh action and displays a "last updated" timestamp. Users can customise their dashboard layout by hiding entire rows using the "Customize" toggle, with hidden row preferences persisted in the browser\'s local storage for consistent viewing across sessions.');

np();
h1('7. Profile Management');

h2('Overview');
p('The Profile Management module enables every authenticated user to view and edit their personal account details from a single, consolidated interface. Users can update their display name, email address, and profile photograph, as well as change their password through a secure, OTP-verified workflow. Super Administrators additionally have the ability to edit any user\'s profile from the User Management page, providing centralised account administration across the organisation.');
p('The profile page is accessible to all roles and serves as the user\'s identity hub within the system. Changes made to profile information are reflected immediately across the platform, including in order histories, notification delivery, and team views. The OTP-based password change workflow ensures that password updates are authenticated through the user\'s registered email, adding an extra layer of security beyond simple password confirmation.');

h2('Who Can Use This Module?');
drawTable(['Role', 'Access Level', 'Purpose'], [
  ['Super Admin', 'Full', 'Edit own profile; edit any user profile from User Management'],
  ['Building Manager', 'Own Profile', 'Update personal details and change password'],
  ['Restaurant Manager', 'Own Profile', 'Update personal details and change password'],
  ['Chef', 'Own Profile', 'Update personal details and change password'],
  ['Customer', 'Own Profile', 'Update personal details and change password'],
], [140, 120, W - 270]);

h2('Where Can It Be Accessed?');
p('The Profile page is accessible from the sidebar navigation under "Profile" for all roles, and also from the user dropdown menu in the Top Bar. Super Administrators can additionally access any user\'s module configuration from the User Management page. Navigation path: Sidebar \u2192 Profile, or Top Bar Menu \u2192 Profile.');

h2('How It Works');
p('When a user navigates to the Profile page, the system displays their current information in a clean card layout showing the avatar, username, email address, role badge, assigned building and restaurant (where applicable), and phone number. An "Edit" button enables the user to switch to edit mode, revealing editable fields for username, email, and avatar upload. The avatar upload supports common image formats up to 2 MB in size and converts the image to a base64 data URL for storage.');
p('The password change feature follows a three-step verification workflow. First, the user enters their current password, the new password, and a confirmation of the new password. Upon submission, the system validates the current password against the stored hash and, if correct, sends a six-digit OTP to the user\'s registered email address. The user then enters the OTP in the verification step, and upon successful validation, the password is updated. In development environments where email is not configured, the OTP is displayed on screen for testing purposes.');

screenshot('Profile Page', 'The profile management interface showing user details, edit controls, and the password change section.', ['Avatar display with upload capability for profile photographs', 'Editable username and email fields with validation', 'OTP-based password change workflow with step indicators', 'Role badge and organisational context display']);

flowChart('Password Change Process', ['Start: User opens\nProfile page', 'Clicks Change\nPassword', 'Enters current\n+ new password', 'Current pwd\nvalid?', 'OTP sent to\nregistered email', 'User enters\nOTP code', 'OTP valid?', 'Password\nupdated', 'End: Success\nnotification']);

h2('Example Scenario');
p('A Restaurant Manager receives a notification that their password will expire soon. They navigate to their Profile page, click "Change Password," enter their current password and a new secure password. The system sends a six-digit OTP to their registered email. The manager checks their email inbox, copies the code, enters it on the verification screen, and receives a confirmation that their password has been updated successfully. They can now continue using the system with their new credentials.');

h2('Business Rules');
li('Avatar images are limited to 2 MB in size and are stored as base64-encoded strings.');
li('Passwords must be at least 6 characters long and are hashed using bcrypt before storage.');
li('OTP codes expire after 10 minutes; expired codes cannot be used for verification.');
li('Each OTP can only be used once; a new OTP is generated for each password change request.');
li('The current password must be verified before an OTP is sent.');
li('Super Administrators can edit any user\'s profile including avatar, username, and email through the User Management page.');

h2('Expected Outcome');
p('Upon completing a profile update, the changes are immediately visible on the Profile page and reflected across the system. After a successful password change, the user can log out and log back in using the new password without any interruption to their current session.');

np();
h1('8. Notification System');

h2('Overview');
p('The Notification System provides real-time, role-aware alerts that keep all users informed of important events as they happen. Unlike traditional polling-based systems that periodically check for updates, this platform uses Socket.IO WebSocket connections to push notifications instantly from the server to connected clients. Notifications are persisted in the database, allowing users to view their full notification history even after refreshing the page or logging in from a different device.');
p('The system generates notifications for events relevant to each user role: customers receive order status updates as their food progresses through preparation and delivery; restaurant staff are alerted when new orders are placed and require attention; and all users can see a consolidated view of their recent notifications in both the Top Bar dropdown and the dashboard widget. The notification bell icon displays an unread count badge, providing an immediate visual cue of pending notifications.');

h2('Who Can Use This Module?');
drawTable(['Role', 'Notification Types Received', 'Access'], [
  ['Super Admin', 'All system events, new orders, order updates', 'Top Bar, Dashboard widget'],
  ['Building Manager', 'Order updates for building restaurants', 'Top Bar, Dashboard widget'],
  ['Restaurant Manager', 'New orders, order status changes, payment confirmations', 'Top Bar, Dashboard widget'],
  ['Chef', 'New orders, order status changes', 'Top Bar, Dashboard widget'],
  ['Customer', 'Payment success, order preparing, order ready, delivered', 'Top Bar, Dashboard widget'],
], [140, 200, W - 350]);

h2('Where Can It Be Accessed?');
p('Notifications are accessible from two locations: the bell icon in the Top Bar provides a quick-dropdown view of recent notifications with a "Mark all read" action; the Notification widget on the Dashboard displays the five most recent notifications alongside other dashboard panels. Navigation path: Top Bar \u2192 Bell Icon, or Dashboard \u2192 Notification Widget.');

h2('How It Works');
p('When a significant event occurs, such as a payment being processed or an order status changing, the backend controller creates a Notification record in the database and simultaneously emits a real-time event through Socket.IO to the affected user\'s personal room. The frontend, which maintains a persistent WebSocket connection, receives the event and immediately prepends the new notification to the in-memory notification list without requiring a page refresh.');
p('On initial page load, the frontend fetches the user\'s full notification history from the REST API, ensuring that notifications persist across sessions. The "Mark all read" action sends a PATCH request to the API, which updates all unread notifications to read status in the database, and the local state is updated to reflect the change. The unread count badge on the bell icon recalculates automatically based on notifications with read set to false.');

flowChart('Notification Flow', ['Start: Event occurs\n(order update, payment)', 'Controller creates\nNotification record', 'Socket.IO emits\nnew-notification event', 'User\'s client\nreceives event', 'Notification prepended\nto local state', 'Bell badge count\nupdates', 'Dashboard widget\nshows latest', 'End: User sees\nnotification']);

h2('Example Scenario');
h3('Customer Scenario');
p('A customer places an order and completes payment. The system creates a "Payment successful" notification and sends it to the customer\'s notification feed. When the chef starts preparing the order, another notification is pushed: "Your order is being prepared!" When the order is ready for pickup, the customer receives a third notification: "Your order is ready!" All three appear in real time in the customer\'s notification dropdown without any page refresh.');

h3('Staff Scenario');
p('A Restaurant Manager is monitoring operations from the Dashboard. A customer completes payment for a new order. The system creates a "New order #ORD-1234 from Customer" notification and emits it to the restaurant room. The manager sees the notification appear instantly in the Top Bar dropdown with an updated unread count and can immediately navigate to the Orders page to begin processing.');

h2('Business Rules');
li('Notifications are persisted in the database and survive page refreshes and session changes.');
li('Each notification is linked to a specific user and optionally to a specific order for context.');
li('The "Mark all read" action updates the database and cannot be undone.');
li('Unread notifications are visually distinguished from read notifications by reduced opacity.');
li('Notification history is limited to the 100 most recent records per user.');

h2('Expected Outcome');
p('Users receive immediate, real-time visibility into events that matter to their role without needing to manually refresh pages or poll for updates. The combination of persisted history and real-time push ensures that no important event is missed, whether the user is actively watching the screen or catching up after being away.');

np();
h1('9. Order Management');

h2('Overview');
p('Order Management handles the complete order lifecycle from placement through delivery across five stages: PENDING_PAYMENT, PAID, PREPARING, COMPLETED, and DELIVERED. Real-time updates via Socket.IO ensure all staff see changes instantly. When an order reaches COMPLETED, the system automatically deducts corresponding ingredient quantities from inventory if recipe mappings exist.');

drawTable(['Role', 'Access Level', 'Actions Allowed'], [
  ['Super Admin', 'Read-only', 'Monitor orders across all locations'],
  ['Building Manager', 'Read-only', 'Monitor orders in assigned building'],
  ['Restaurant Manager', 'Full', 'View, filter, update status, manage all orders'],
  ['Chef', 'Operational', 'View orders, update status (PAID to COMPLETED)'],
  ['Customer', 'Self', 'Place orders, view personal order history'],
], [140, 100, W - 250]);

flowChart('Order Lifecycle', ['Start: Customer\nplaces order', 'PENDING_PAYMENT', 'Payment\nsuccessful', 'PAID', 'Chef starts\npreparation', 'PREPARING', 'Order ready', 'COMPLETED\n(stock deducted)', 'Hand to\ncustomer', 'DELIVERED', 'End: Order\ncomplete']);

h2('Business Rules');
li('Order statuses must progress sequentially and cannot be reversed to a previous status.');
li('Inventory deduction triggers only on COMPLETED status when recipe mappings exist.');
li('Order codes are unique 6-character alphanumeric strings generated at order creation.');
li('Socket.IO broadcasts all status changes to connected clients in real-time.');

np();
h1('10. Menu Management');

h2('Overview');
p('The Menu Management module enables restaurants to create, edit, and maintain digital menu offerings. Each item includes a name, description, price in INR, food category (VEG, NON_VEG, or VEGAN with colour-coded indicators), an optional image, and an active/inactive toggle. Changes take effect immediately in the customer-facing ordering interface.');

drawTable(['Role', 'Access Level', 'Actions Allowed'], [
  ['Super Admin', 'Full', 'Create, edit, delete menu items across all restaurants'],
  ['Restaurant Manager', 'Full', 'Create, edit, delete menu items for their restaurant'],
  ['Building Manager', 'Read-only', 'View menus across the building'],
  ['Chef', 'Read-only', 'View menu items and ingredient mappings'],
  ['Customer', 'Browse', 'View active menu items during ordering'],
], [140, 100, W - 250]);

h2('Business Rules');
li('Item name and price are required fields; description and image are optional.');
li('Prices are in Indian Rupees as whole numbers without decimal places.');
li('Only active items are visible to customers; inactive items retain database records.');
li('Each restaurant maintains its own independent menu.');

np();
h1('11. Inventory Management');

h2('Overview');
p('The Inventory Management module provides comprehensive control over restaurant stock with 12 integrated sections covering the complete inventory lifecycle. The auto-deduction feature, powered by recipe mappings, eliminates manual stock adjustments and provides real-time inventory accuracy. The structured procurement workflow ensures optimal stock levels through systematic ordering and approval controls.');

drawTable(['Role', 'Access Level', 'Actions Allowed'], [
  ['Super Admin', 'Full', 'All inventory functions across all restaurants'],
  ['Building Manager', 'High', 'View and manage inventory across building restaurants'],
  ['Restaurant Manager', 'Full', 'Complete inventory control for their restaurant'],
  ['Chef', 'Limited', 'View inventory, log wastage'],
], [140, 100, W - 250]);

flowChart('Inventory Replenishment', ['Start: Low stock\nalert triggered', 'Manager creates\nPurchase Order', 'PO sent for\napproval', 'Approved?', 'Vendor delivers\ngoods', 'Goods Receipt\ncreated', 'Inventory\nlevels updated', 'End: Stock\nrestored']);

h2('Business Rules');
li('Auto-deduction only triggers on COMPLETED order status with existing recipe mappings.');
li('Transfers and Adjustments require managerial approval before execution.');
li('All stock changes create an InventoryMovement audit record for complete traceability.');

np();
h1('12. Restaurant & Building Management');

h2('Overview');
p('Buildings represent physical locations such as shopping malls or complexes. Restaurants are operational outlets within buildings. This hierarchy scopes all other modules: menus, orders, inventory, and users belong to a specific restaurant within a specific building. A Building Manager oversees all restaurants in their building; each Restaurant Manager handles their own outlet.');

drawTable(['Role', 'Buildings', 'Restaurants'], [
  ['Super Admin', 'Create, edit, delete all', 'Create, edit, delete all'],
  ['Building Manager', 'View assigned building', 'View, edit in assigned building'],
  ['Restaurant Manager', 'Read-only', 'View, edit own restaurant'],
], [140, 140, W - 290]);

h2('Business Rules');
li('Each Building can contain multiple Restaurants; each Restaurant belongs to exactly one Building.');
li('Deactivating a Building hides all its Restaurants from active views.');
li('Buildings and Restaurants with associated orders or users cannot be permanently deleted.');

np();
h1('13. User Management');

h2('Overview');
p('The User Management module provides centralised control over system access. Administrators can create, edit, and delete user accounts, assign roles with appropriate permissions, and configure module-level access toggles. User management is distributed according to the role hierarchy, allowing each management level to handle their own staffing needs.');

drawTable(['Role', 'User Scope', 'Manageable Roles'], [
  ['Super Admin', 'All users (system-wide)', 'All roles (100, 70, 50, 40, 10)'],
  ['Building Manager', 'Users in assigned building', 'RM (50), Chef (40), Customer (10)'],
  ['Restaurant Manager', 'Users in assigned restaurant', 'Chef (40), Customer (10)'],
], [140, 140, W - 290]);

h2('Business Rules');
li('Users can only manage accounts with roles strictly below their own level.');
li('Self-deletion is prevented by the system.');
li('Passwords are stored as bcrypt hashes; plain text is never persisted.');

np();
h1('14. Module Access Control');

h2('Overview');
p('Module Access Control enables Super Administrators to fine-tune which modules each user can access, overriding default role-based permissions. The resolution follows a three-tier priority system: User-level overrides take highest precedence, followed by Restaurant-level, then Building-level, with a default fallback of all modules enabled.');

flowChart('Module Resolution Priority', ['Start: Check\nuser override', 'Override\nexists?', 'Use user-level\nisEnabled', 'Check restaurant\noverride', 'Override\nexists?', 'Use restaurant\nisEnabled', 'Check building\noverride', 'Override\nexists?', 'Use building\nisEnabled', 'Default:\nALL ENABLED', 'End: Access\ndetermined']);

h2('Business Rules');
li('Resolution priority: User-level > Restaurant-level > Building-level > Default (all enabled).');
li('Super Admin bypasses all override checks and sees every module.');
li('Overrides use an upsert pattern: create new or update existing as needed.');

np();
h1('15. QR Code Scanner');

h2('Overview');
p('The QR Code Scanner enables staff to instantly identify orders using the customer\'s digital receipt. Integrated into both the Orders page and Delivery Confirmation page, the scanner reads QR codes encoding { orderId, orderCode } for fast, error-free order lookup that eliminates manual data entry errors.');

drawTable(['Role', 'Access Level', 'Actions Allowed'], [
  ['Restaurant Manager', 'Full', 'Scan orders on Orders page and Delivery Confirmation'],
  ['Chef', 'Operational', 'Scan orders on Orders page'],
], [140, 100, W - 250]);

flowChart('QR Scanning Workflow', ['Start: Customer\nshows QR code', 'Staff opens\nscanner', 'Camera scans\nQR code', 'System decodes\norderId + code', 'Order identified\nand displayed', 'End: Staff\nprocesses order']);

h2('Business Rules');
li('Camera permission must be granted by the browser for the scanner to function.');
li('Only PAID and COMPLETED orders display QR codes for scanning.');

np();
h1('16. Delivery Confirmation');

h2('Overview');
p('Delivery Confirmation is the terminal step in the order lifecycle. Staff formally record that an order has been handed over to the customer, updating the status to DELIVERED. The feature supports QR code scanning for instant identification and manual order code entry as a fallback.');

drawTable(['Role', 'Access Level', 'Actions Allowed'], [
  ['Restaurant Manager', 'Full', 'Confirm delivery for all orders in their restaurant'],
  ['Chef', 'Operational', 'Confirm delivery for prepared orders'],
], [140, 100, W - 250]);

flowChart('Delivery Process', ['Start: Customer\narrives for pickup', 'Enter order code\n(scan or manual)', 'System validates\norder code', 'Code valid and\nCOMPLETED?', 'Status updated\nto DELIVERED', 'End: Transaction\ncomplete']);

h2('Business Rules');
li('Confirmation only works for orders currently in COMPLETED status.');
li('Delivery confirmation is irreversible; no undo is available.');

np();
h1('17. Module Management (Super Admin)');

h2('Overview');
p('Module Management provides a comprehensive interface for Super Administrators to configure system-wide module overrides at the Building, Restaurant, or User level. The page is organised into four views accessed through toggle buttons: Building, Restaurant, User, and a dedicated User Modules view. The Building, Restaurant, and User tabs display existing overrides at each level with options to add new overrides via a modal dialogue that includes entity selectors for choosing the specific building, restaurant, or user. The User Modules view presents a complete user-by-user breakdown showing exactly which modules are enabled and disabled for every account in the system.');
p('The User Modules view is particularly powerful for auditing and troubleshooting, displaying each user alongside their effective module set. For users who have custom module overrides, the view shows a "Custom" badge and lists both enabled and disabled modules separately. For users relying on role defaults, a "Role Defaults" badge is displayed along with the modules that their role entity is configured to access. This comprehensive visibility enables administrators to quickly verify that the right users have access to the right features without needing to cross-reference between multiple screens.');

drawTable(['Role', 'Access Level', 'Actions Allowed'], [
  ['Super Admin', 'Full', 'View all modules, configure overrides at all levels, user-module matrix'],
  ['All Other Roles', 'No Access', 'Module Management page is not visible'],
], [140, 100, W - 250]);

h2('How It Works');
p('The page loads all modules, all existing overrides at all levels, and the complete list of buildings, restaurants, and users on initial render. The active tab determines which set of overrides is displayed in the list view. Adding a new override opens a modal with three fields: the entity selector (building, restaurant, or user depending on the active tab), the module selector, and the enabled/disabled toggle. Saving creates or updates the override record and refreshes the override list.');
p('The User Modules tab provides a fundamentally different view. Instead of listing raw override records, it computes and displays the effective module access for every user in the system. For each user, the system evaluates whether they have custom overrides (from the User Management page or direct override creation) or rely on role defaults defined in the frontend configuration. Enabled modules are displayed with green badges and a checkmark icon; disabled modules appear with red badges and a crossmark icon, giving administrators an immediate, intuitive understanding of each user\'s access profile.');

screenshot('User Modules View', 'The User Modules tab displaying effective module access for all users.', ['User cards showing username, email, role badge, and override source indicator', 'Green badges with check icons for enabled modules', 'Red badges with cross icons for disabled modules', 'Custom vs Role Defaults source labelling for audit clarity']);

flowChart('Module Management Workflows', ['Start: Admin opens\nModule Management', 'Choose tab:\nBuilding/Restaurant/User', 'Existing overrides\nlisted for level', 'Click Add\nOverride', 'Select entity,\nmodule, enable/disable', 'Override saved;\nlist refreshed', 'OR: View User\nModules tab', 'All users with\neffective access shown', 'End: Complete\nvisibility']);

h2('Business Rules');
li('Only Super Administrators can access this page and its API endpoints.');
li('Resolution priority: User-level > Restaurant-level > Building-level > Default (enabled).');
li('Super Admin bypasses all override checks regardless of settings.');
li('Override records can be deleted individually from the list view using the trash icon.');
li('The User Modules view is read-only; modifications must be made through the User Management page or the User overrides tab.');
li('Role defaults are defined in the system constants and only apply when no explicit override exists for a user.');

// ═══════════════════════════════ GLOSSARY ═══════════════════════════════
np();
h1('Glossary');
drawTable(['Term', 'Definition'], [
  ['API', 'Application Programming Interface \u2014 a set of protocols for building and integrating application software'],
  ['CRUD', 'Create, Read, Update, Delete \u2014 the four basic operations of persistent storage'],
  ['GRN', 'Goods Receipt Note \u2014 a document acknowledging receipt of goods from a vendor'],
  ['JWT', 'JSON Web Token \u2014 a compact, URL-safe token format used for authentication'],
  ['KDS', 'Kitchen Display System \u2014 a digital display showing incoming orders to kitchen staff'],
  ['KPI', 'Key Performance Indicator \u2014 a measurable value that demonstrates how effectively objectives are achieved'],
  ['ORM', 'Object-Relational Mapping \u2014 a technique for converting data between type systems in OOP languages'],
  ['PO', 'Purchase Order \u2014 a commercial document issued by a buyer to a seller'],
  ['POS', 'Point of Sale \u2014 the place where a retail transaction is completed'],
  ['RBAC', 'Role-Based Access Control \u2014 an approach to restricting system access to authorised users'],
  ['SKU', 'Stock Keeping Unit \u2014 a unique identifier for each product or item in inventory'],
  ['SPA', 'Single-Page Application \u2014 a web application that loads a single HTML page and dynamically updates content'],
  ['UAT', 'User Acceptance Testing \u2014 the final phase of testing before system deployment'],
], [60, W - 70]);

// ═══════════════════════════════ APPENDIX ═══════════════════════════════
np();
h1('Appendix');

h2('Version History');
drawTable(['Version', 'Date', 'Author', 'Changes'], [
  ['1.0', 'June 2026', 'POS System Team', 'Initial release'],
], [60, 80, 120, W - 270]);

h2('Known Limitations');
li('The dashboard does not auto-refresh; users must reload the page to view updated KPI data.');
li('QR code scanning requires an active camera and may not function on all mobile browsers.');
li('The system currently supports Indian Rupees (INR) as the sole currency.');

h2('Future Enhancements');
li('Real-time dashboard auto-refresh via WebSocket push updates.');
li('Multi-currency support for international restaurant chains.');
li('Advanced analytics with predictive inventory and demand forecasting.');
li('Offline mode for order processing during network interruptions.');
li('Mobile native applications for iOS and Android platforms.');

h2('Support Contact');
p('For technical support, feature requests, or issue reporting, contact the POS System team through the project repository at https://github.com/PugazhendhiS-alt/FNB or raise a ticket through the organisation\'s IT support portal.');

doc.moveDown(2);
doc.fontSize(8).fillColor(LIGHT).font('Helvetica').text('\u2014 End of Document \u2014', { align: 'center', width: W });
doc.end();
console.log('PDF generated: POS_System_User_Guide.pdf');
