# ACB Food - Branch Architecture

## 🏗️ Project Overview

The ACB Food repository uses **separate branches** for different applications to maintain clean separation of concerns.

### Branch Structure

```
acbfood/
├── main (origin/main)
│   └── User-facing PWA for food ordering
│
└── admin/portal (origin/admin/portal)
    └── Web-only admin management portal
```

---

## 📱 Main Branch - User Frontend PWA

**Branch:** `main`

### Purpose
- Customer-facing progressive web app
- Food ordering and browsing interface
- Integration with native mobile apps
- Token-based authentication from the native app

### Key Features
- Browse restaurants/cafeterias by building
- View menus and place orders
- Shopping cart management
- Order history and tracking
- Profile management
- Search functionality
- PWA for offline access

### Technology
- React + TypeScript
- Vite for bundling
- Shadcn UI components
- Sonner for toast notifications
- TanStack Query for data management

### Key Routes
```
/                  Home/Building selection
/building/:id      Cafeterias in a building
/cafeteria/:id     Menu items for a cafeteria
/search            Search functionality
/cart              Shopping cart
/checkout          Order checkout
/orders            Order history
/profile           User profile
```

### Providers
- QueryClientProvider
- TooltipProvider
- CartProvider
- Toaster (UI notifications)

### Authentication
- Token-based (received from native app)
- No login page on user frontend

### Data Source
- Mock data from `src/data/mockData.ts`
- Can be connected to backend API

---

## 👨‍💼 Admin/Portal Branch - Admin Portal

**Branch:** `admin/portal`

### Purpose
- Web-only admin management interface
- Manage restaurants/cafeterias
- Manage menu items
- Separate from user-facing app

### Key Features
- Admin login/authentication
- Restaurant CRUD operations (Create, Read, Update, Delete)
- Menu item management
- Search and filter functionality
- Restaurant statistics dashboard
- Building assignment
- Open/closed status management
- Dietary options (vegetarian, vegan)
- Image management

### Technology
- React + TypeScript
- Vite for bundling
- Shadcn UI components (same design system)
- Sonner for toast notifications
- TanStack Query for data management

### Key Routes
```
/login             Admin login page
/dashboard         Main restaurant management
/menu/:id          Menu items for a restaurant
(root /)           Redirects to /login
```

### Providers
- QueryClientProvider
- TooltipProvider
- AdminProvider (authentication)
- CafeteriaProvider (data management)
- Toaster (UI notifications)

### Authentication
- Email/Password based
- localStorage persistence
- Session-based (client-side only)
- Demo credentials: any email with password `admin`

### Data Storage
- localStorage for persistence
- Can be connected to backend API
- Auto-saves all changes

---

## 🔄 Comparison Matrix

| Feature | Main (User) | Admin/Portal |
|---------|-------------|--------------|
| **Purpose** | Customer app | Admin panel |
| **Auth Type** | Token-based | Email/Password |
| **Storage** | App-provided token | localStorage |
| **Routes** | `/building`, `/cafeteria`, `/cart`, etc. | `/login`, `/dashboard`, `/menu` |
| **Cart** | ✅ Yes | ❌ No |
| **Orders Feature** | ✅ Yes | ❌ No |
| **Restaurant Management** | ❌ No | ✅ Yes |
| **Menu Management** | ❌ No | ✅ Yes |
| **Web/PWA** | ✅ PWA + Native | ✅ Web-only |
| **UI Context** | Customer journey | Admin workflow |

---

## 🚀 Development Workflow

### Working on User Frontend (Main)
```bash
# Clone repo
git clone https://github.com/sl23ai/acbfood.git
cd acbfood

# Already on main
npm install
npm run dev
```

### Working on Admin Portal
```bash
# Clone repo
git clone https://github.com/sl23ai/acbfood.git
cd acbfood

# Switch to admin portal branch
git checkout admin/portal

# Install dependencies
npm install
npm run dev
```

### Creating a Feature
```bash
# For user frontend
git checkout -b feature/user-something main

# For admin portal
git checkout -b feature/admin-something admin/portal
```

---

## 📦 Deployment Strategy

### Main Branch (User Frontend)
```
Deploy to: https://app.acbfood.com
Type: PWA + Native app integration
Environment: Production
Auth: Token from native app
```

### Admin/Portal Branch
```
Deploy to: https://admin.acbfood.com
Type: Web application
Environment: Production
Auth: Email/Password
```

---

## 🔐 No Integration Between Branches

**Important:** The two branches are intentionally **completely separate**:

✅ **DO HAVE:**
- Separate Git histories
- Independent deployments
- Different feature sets
- Different authentication
- Different user bases

❌ **NO:**
- Shared routes
- Navigation between apps
- Shared authentication
- Direct links in UI
- Code sharing (except UI components library)

---

## 📊 Data Flow

### Main Branch
```
Native App 
    ↓ (token)
Browser PWA (main)
    ↓
Mock Data / Backend API
    ↓
Display Restaurants & Menus
```

### Admin/Portal Branch
```
Admin Browser
    ↓
Login (admin/password)
    ↓
Admin Portal
    ↓
localStorage / Backend API
    ↓
Manage Restaurants & Menus
```

---

## 🎨 Shared Assets

The following are shared across both branches:

### UI Components
- All components in `src/components/ui/` (Shadcn UI)
- Theme and styling system
- Tailwind CSS configuration

### Data Models
- Interface definitions in `src/data/mockData.ts`
- Building, Cafeteria, MenuItem types

### Utilities
- `src/lib/utils.ts`
- Common utility functions

### Assets
- Logo and images in `src/assets/`

---

## 🛠️ Build & Deploy

### Build Main Branch
```bash
npm run build
# Output: dist/ directory for user PWA
```

### Build Admin/Portal Branch
```bash
npm run build
# Output: dist/ directory for admin app
```

Both can be deployed independently.

---

## 📚 Documentation

### Main Branch Documentation
- [`README.md`](README.md) - User app overview
- [`src/pages/`](src/pages/) - User page components
- [`src/contexts/CartContext.tsx`](src/contexts/CartContext.tsx) - Cart logic

### Admin Branch Documentation
- [`README_ADMIN.md`](README_ADMIN.md) - Admin app overview
- [`ADMIN_PORTAL_DOCS.md`](ADMIN_PORTAL_DOCS.md) - Detailed admin docs
- [`src/contexts/AdminContext.tsx`](src/contexts/AdminContext.tsx) - Auth logic
- [`src/contexts/CafeteriaAdminContext.tsx`](src/contexts/CafeteriaAdminContext.tsx) - Admin data management

---

## 🔍 Quick Checks

### Verify Branch Separation
```bash
# Check main branch (user only)
git checkout main
grep -r "AdminContext" src/  # Should return NO results

# Check admin branch (admin only)
git checkout admin/portal
grep -r "CartProvider" src/  # Should return NO results
```

---

## 🚀 Future Roadmap

### Main Branch
1. Backend API integration
2. Real token-based authentication
3. Push notifications
4. Enhanced offline support
5. Payment gateway integration

### Admin/Portal Branch
1. Backend API integration
2. JWT-based real authentication
3. Role-based access control
4. Image upload functionality
5. Advanced analytics and reporting
6. Bulk operations and import/export

---

## 📞 Support & Questions

- For **user app** issues: Check `README.md`
- For **admin portal** issues: Check `README_ADMIN.md` and `ADMIN_PORTAL_DOCS.md`
- For **architecture** questions: Refer to this document

---

## 📌 Key Takeaways

1. ✅ **Two separate branches** = Two separate applications
2. ✅ **Independent development** = No interference between features
3. ✅ **Independent deployment** = Can update separately
4. ✅ **Shared components** = Consistent UI across apps
5. ✅ **Clear separation** = No confusing navigation or mixed code

**This architecture enables clean, scalable development for both user and admin experiences.**
