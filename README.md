# POS System

Full-featured Point-of-Sale and restaurant management platform with role-based access, real-time order tracking, QR code menu access, and interactive dashboard.

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set up Environment Variables

**backend/.env** (already configured for SQLite):
```
DATABASE_URL="file:./dev.db"
# Generate a secure secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="change-me-to-a-secure-random-secret"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

### 3. Initialize Database

```bash
cd backend
npm run setup
```

This runs Prisma db push and seeds the database with demo data.

### 4. Start Backend

```bash
cd backend
npm run dev
```

Starts on **http://localhost:5000**

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Starts on **http://localhost:3000**

### 6. Access the App

Open **http://localhost:3000**

### Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| Superadmin | Admin12345 | Super Admin |
| admin1 | admin123 | Admin |
| bldmgr1 | manager123 | Building Manager |
| restmgr1 | manager123 | Restaurant Manager |
| chef1 | chef123 | Chef |
| customer1 | customer123 | Customer |
