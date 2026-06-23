# POS System — Project Context

## Overview
Full-stack Point-of-Sale system with React frontend, Node.js/Express backend, PostgreSQL database.

## Repository
- **GitHub**: https://github.com/PugazhendhiS-alt/FNB
- **Branch**: `pos-system` (active development branch)
- **Local path**: `C:\Users\1552001\pos-system`

## Deployment (Railway)
- **Frontend**: https://fnb-mvp.up.railway.app
- **Backend API**: https://mvp-fnb.up.railway.app
- **Health check**: https://mvp-fnb.up.railway.app/api/health
- **PostgreSQL**: Railway managed (DATABASE_URL auto-injected)
- **GitHub Actions**: `.github/workflows/deploy.yml` — auto-deploys on push to `pos-system`

## Railway Environment Variables

### Backend Service
| Variable | Value |
|----------|-------|
| `JWT_SECRET` | `pos-system-jwt-secret-2024` |
| `CLIENT_URL` | `https://fnb-mvp.up.railway.app` |

### Frontend Service
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://mvp-fnb.up.railway.app/api` |
| `VITE_SOCKET_URL` | `https://mvp-fnb.up.railway.app` |

### Service Configuration
| Service | Root Dir | Target Port |
|---------|----------|-------------|
| Backend | `backend` | 8080 |
| Frontend | `frontend` | 8080 |

## Local Development

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL) or local PostgreSQL

### Setup
```bash
cd backend
npm install
npm run setup    # runs prisma db push + seed
npm run dev      # starts on port 5000

cd ../frontend
npm install
npm run dev      # starts on port 3000
```

### Local .env (backend/.env)
```
DATABASE_URL="postgresql://pos_user:pos_password@localhost:5432/pos_system"
# Generate a secure secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="change-me-to-a-secure-random-secret"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

## Project Structure
```
pos-system/
├── backend/
│   ├── prisma/          # Schema, migrations, seed
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/   # Auth, roles, error handler
│   │   ├── routes/      # API routes
│   │   ├── socket/      # Socket.IO setup
│   │   ├── utils/       # Helpers, JWT, mailer, SMS
│   │   └── server.js    # Entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios client & endpoints
│   │   ├── components/  # UI components
│   │   ├── context/     # Auth, Socket contexts
│   │   ├── pages/       # Route pages
│   │   └── App.jsx
│   ├── Dockerfile
│   └── server.js        # Prod static file server
├── docker-compose.yml    # Local Docker setup
├── .github/workflows/    # GitHub Actions deploy
└── railway.json          # Railway config
```

## Demo Credentials
| Username | Password | Role |
|----------|----------|------|
| Superadmin | Admin12345 | Super Admin |
| bldmgr1 | manager123 | Building Manager |
| restmgr1 | manager123 | Restaurant Manager |
| restmgr2 | manager123 | Restaurant Manager |
| chef1 | chef123 | Chef |
| customer1 | customer123 | Customer |
| customer2 | customer123 | Customer |
| chef2 | chef123 | Chef |

## Key Tech
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Headless UI 2
- **Backend**: Node.js, Express, Prisma ORM, JWT, Socket.IO
- **Database**: PostgreSQL (production), SQLite swapped to PostgreSQL
- **Deploy**: Railway (Docker-based), auto-deploy via GitHub push

## Common Tasks

### Add a new feature
1. Create branch: `git checkout -b feature/name`
2. Make changes
3. Test locally: run both backend & frontend
4. Commit and push
5. Merge to `pos-system` → auto-deploys to Railway

### Run seed again
```bash
cd backend && node prisma/seed.js
```
On Railway: Backend service → **Run** tab → `node prisma/seed.js`

### Check logs
- Railway dashboard → service → **Deployments** → **View Logs**
- Or Railway dashboard → service → **Logs** tab

### Rebuild frontend with new env vars
Add vars in Railway frontend → **Variables** → auto-redeploys
