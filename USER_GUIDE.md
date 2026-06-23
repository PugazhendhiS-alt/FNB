# POS System — User Guide & Documentation

## 1. Overview

A full-featured enterprise Point-of-Sale and restaurant management platform with role-based access, real-time order tracking, QR code menu access, and an interactive dashboard with customizable widgets.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                │
│  Port 5173 · Tailwind CSS · Headless UI · Socket.IO     │
├─────────────────────────────────────────────────────────┤
│                     Backend (Node.js + Express)           │
│  Port 5000 · Prisma ORM · JWT Auth · Socket.IO          │
├─────────────────────────────────────────────────────────┤
│                     Database (PostgreSQL)                  │
│  Railway-managed or local Docker                        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Role-Based Access

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access — manages users, buildings, restaurants, menu, orders, dashboard widgets |
| **Admin** | Same as Super Admin minus user role escalation |
| **Building Manager** | Manages restaurants within assigned building, limited dashboard |
| **Restaurant Manager** | Manages menu items, order queue for assigned restaurant |
| **Chef** | Views order queue, updates preparation status |
| **Customer** | Browses restaurants & menus, places orders, views order history |

---

## 4. Features

### 4.1 Authentication & Login

- **Password Login** — Standard username/password authentication
- **OTP Login** — Enter email or phone number to receive a one-time passcode
- **Guest Login** — Instant customer session without registration
- **Role Switching** — Super Admins can switch to any role to preview the experience

> **Screenshot**: Login page showing Password tab, OTP tab, and Guest button
> *File: `docs/screenshots/login.png`*

### 4.2 Dashboard & Widgets

- Role-filtered widget grid with stat cards, charts, lists, progress bars
- Drag-free CSS grid layout (no overlap)
- Custom widget creation from 9 predefined data sources
- Trend indicators (▲/▼/–) on stat cards comparing 7-day periods
- Collapsible filter panel and primary metrics bar

> **Screenshot**: Super Admin dashboard with revenue chart, stat cards, recent orders
> *File: `docs/screenshots/dashboard-superadmin.png`*

### 4.3 Restaurant Management

- CRUD operations for restaurants with building assignment
- User assignment (Restaurant Managers / Chefs) per restaurant
- QR code generation for digital menu access
- Building Manager scope — automatically restricted to assigned building

> **Screenshot**: Restaurants table with add/edit/delete actions and building column
> *File: `docs/screenshots/restaurants.png`*

### 4.4 Menu Management

- Add/edit/delete menu items with name, price, category, description
- Toggle item availability (Show/Hide)
- Category-based organization
- Public menu view for customers with QR code access

> **Screenshot**: Menu management with availability toggle buttons
> *File: `docs/screenshots/menu-management.png`*

### 4.5 Order Management

- Real-time order updates via Socket.IO
- Status flow: Pending Payment → Paid → Preparing → Completed → Delivered
- Customer: View "My Orders" with full history
- Restaurants/Menu management for staff roles via dedicated pages

> **Screenshot**: Order list with status tabs and expandable details
> *File: `docs/screenshots/orders.png`*

### 4.6 Building Management

- CRUD for buildings
- Building Manager assignment
- Restaurant count per building

> **Screenshot**: Buildings table
> *File: `docs/screenshots/buildings.png`*

### 4.7 User Management

- CRUD for users with role assignment
- Building/Restaurant assignment fields appear dynamically based on role
- Role hierarchy enforcement (admins cannot create other admins)

> **Screenshot**: Users table with role badge colors and building/restaurant columns
> *File: `docs/screenshots/users.png`*

---

## 5. User Guide

### 5.1 First-Time Login

1. Open the app at `http://localhost:5173`
2. Use demo credentials:
   - **Superadmin** / `Admin12345`
   - **customer1** / `customer123`
3. Or click **Continue as Guest** for instant customer access

### 5.2 OTP Login Flow

1. Click **OTP Login** tab
2. Enter your registered **email** or **phone number**
3. Click **Send OTP**
4. Check your email/SMS for the 6-digit code
5. Enter the code in the OTP input fields
6. Click **Verify & Sign In**

### 5.3 Role Switching (Super Admin Only)

1. Click the user icon in the top-right header
2. Click any role in the **Switch Role** section
3. The UI instantly updates to that role's view
4. All sidebar links, dashboard widgets, and permissions reflect the active role

### 5.4 Managing Restaurants

1. Navigate to **Restaurants** in the sidebar
2. Click **Add Restaurant** to create a new one
3. Fill in name, cuisine, phone, and select a building
4. Optionally assign Restaurant Managers or Chefs from the user list
5. Click **Create** — the table refreshes automatically

### 5.5 Generating QR Codes

1. Click the QR code icon next to any restaurant
2. A modal displays the QR code and direct menu link
3. Click **Download PNG** to save or **Copy Link** to share

### 5.6 Toggling Menu Item Availability

1. Navigate to a restaurant's menu (click eye icon in Restaurants table)
2. Click **Hide** / **Show** next to any item
3. The item's availability toggles instantly

### 5.7 Managing Dashboard Widgets

1. Navigate to the Dashboard
2. Click **Manage Widgets** to open the widget manager
3. **Available** tab — add system widgets filtered by role
4. **My Widgets** tab — reorder or remove existing widgets
5. **Custom** tab — create custom widgets from data sources

---

## 6. Design System

### 6.1 Colors

| Token | Usage |
|-------|-------|
| `primary-600` (#2563eb) | Buttons, links, active states |
| `primary-50` | Active sidebar background |
| `gray-50` | Page background |
| `gray-900` | Body text |
| `red-600` | Danger actions |
| `green-50/700` | Success badges |

### 6.2 Typography

- Font: System UI (Inter / SF Pro / Segoe UI)
- Sizes: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)
- Weights: medium (500), semibold (600), bold (700)

### 6.3 Spacing

- Cards: `p-4 sm:p-6`
- Modal padding: `p-6 sm:p-8`
- Sidebar: `p-4` with `gap-1` between links
- Page padding: `p-3 sm:p-4 lg:p-6`

### 6.4 Shadows

- Cards: `shadow-sm` with `border border-gray-200`
- Modals: `shadow-xl`
- Buttons: `shadow-sm` on primary, `shadow-md` on hover
- Dropdowns: `shadow-lg`

### 6.5 Animations

- Button hover: `transition-all duration-200`
- Modal enter: `fadeIn 0.2s` + `slideUp 0.2s`
- Sidebar open: `transform transition-transform duration-200`
- Spinner: `animate-spin` for loading states

---

## 7. Default Credentials

| Username | Password | Role |
|----------|----------|------|
| Superadmin | Admin12345 | Super Admin |
| admin1 | admin123 | Admin |
| bldmgr1 | manager123 | Building Manager |
| restmgr1 | manager123 | Restaurant Manager |
| chef1 | chef123 | Chef |
| customer1 | customer123 | Customer |

---

## 8. Image References

Place screenshots in `docs/screenshots/`:

| File | Description |
|------|-------------|
| `login.png` | Login page with Password tab selected, demo credentials box |
| `login-otp.png` | OTP Login tab with email/phone input |
| `login-otp-verify.png` | 6-digit OTP input screen |
| `dashboard-superadmin.png` | Full dashboard with metrics bar, stat cards, revenue chart, recent orders |
| `dashboard-building-manager.png` | Building Manager dashboard (fewer widgets) |
| `dashboard-customer.png` | Customer dashboard |
| `restaurants.png` | Restaurants table with search, columns, actions |
| `restaurant-form.png` | Add/Edit restaurant modal with building dropdown |
| `qr-code-modal.png` | QR code modal with download/copy buttons |
| `menu-management.png` | Menu items table with hide/show toggles |
| `menu-customer.png` | Customer-facing menu grouped by category |
| `orders.png` | Orders list with status tabs |
| `order-detail.png` | Expanded order with items and action buttons |
| `buildings.png` | Buildings table |
| `users.png` | Users table with role badges |
| `user-form.png` | Add/Edit user modal with role/building/restaurant fields |
| `widget-manager.png` | Widget manager with Available/My/Custom tabs |
| `custom-widget-form.png` | Custom widget creation form with data source selector |
| `sidebar.png` | Sidebar with active link highlighting |
| `header.png` | Header with role switcher and notification bell |
| `bottom-nav.png` | Mobile bottom navigation |
| `role-switcher.png` | Role switch dropdown expanded |

---

## 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Headless UI 2, Heroicons 2 |
| Backend | Node.js, Express.js, Prisma ORM, JWT (jsonwebtoken) |
| Database | PostgreSQL |
| Realtime | Socket.IO for order updates |
| Auth | bcryptjs + JWT tokens (7-day expiry) |
| Email | Nodemailer with SMTP configuration |
| QR Code | `qrcode` library (server-side generation) |
| HTTP Client | Axios with token interceptor |
| Routing | React Router v6 |
