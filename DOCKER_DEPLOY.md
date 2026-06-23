# Docker Deployment Guide

Deploy the POS system using Docker Compose with PostgreSQL in production.

## Architecture

```
services:
  db:        postgres:16-alpine   (port 5432)
  backend:   Node.js + Express    (port 5000)
  frontend:  React + Vite         (port 5173)
```

## Prerequisites

- Docker & Docker Compose

## Quick Start

```bash
# Start all services
docker-compose up --build

# Run in background
docker-compose up --build -d
```

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5000/api**

## Environment Variables

Set in `.env.db` and `.env.backend` files (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://pos_user:pos_password@db:5432/pos_system` |
| `JWT_SECRET` | JWT signing secret (set via `.env.backend`) | — |
| `PORT` | Backend port | `5000` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |
| `VITE_API_URL` | API URL for frontend | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket URL for frontend | `http://localhost:5000` |

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop and remove volumes (reset DB)
docker-compose down -v

# Rebuild a single service
docker-compose up --build -d backend
```

## Production Deployment (Railway)

1. Push code to GitHub
2. Create a Railway project from your repo
3. Add PostgreSQL plugin
4. Deploy backend (root dir: `backend/`) and frontend (root dir: `frontend/`) as separate services
5. Set environment variables per service (see above)

> See [USER_GUIDE.md](./USER_GUIDE.md) for full documentation.
