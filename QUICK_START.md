# 🚀 Quick Start Guide

## ⚠️ Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Docker Desktop installed (for PostgreSQL, Redis, Meilisearch)

If Docker is not installed, download from: https://www.docker.com/products/docker-desktop/

## 🎯 Step-by-Step Startup

### Step 1: Install Dependencies

```powershell
# Frontend dependencies (already done if no errors)
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Start Database Services

**Option A - With Docker (Recommended):**
```powershell
docker-compose up -d
```

**Option B - Without Docker (Alternative):**
Install PostgreSQL, Redis, and Meilisearch locally:
- PostgreSQL: https://www.postgresql.org/download/windows/
- Redis: https://github.com/microsoftarchive/redis/releases
- Meilisearch: https://www.meilisearch.com/docs/learn/getting_started/installation

### Step 3: Start Backend Server

Open **Terminal 1**:
```powershell
cd backend
npm run start:dev
```

The backend will start at http://localhost:4000  
Swagger API docs at http://localhost:4000/api/docs

### Step 4: Start Frontend Server

Open **Terminal 2**:
```powershell
npm run dev
```

The frontend will start at http://localhost:3000

## 🎉 You're Ready!

- **Website**: http://localhost:3000
- **API**: http://localhost:4000/api
- **API Docs**: http://localhost:4000/api/docs

## 🔧 Troubleshooting

### Docker not found
Install Docker Desktop from https://www.docker.com/products/docker-desktop/

### Port already in use
```powershell
# Kill process on port 3000
cmd /c "netstat -ano | findstr :3000"
cmd /c "taskkill /F /PID <PID>"
```

### Database connection failed
Make sure Docker services are running:
```powershell
docker-compose ps
```

## 📚 Next Steps

1. **Test the API**: Visit http://localhost:4000/api/docs
2. **Create test user**: Use Swagger to register
3. **Add products**: Use the products endpoint
4. **Test payments**: Add Paystack keys to `.env` files

## 🛠️ Development Commands

```powershell
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Backend
cd backend
npm run start:dev    # Start with hot reload
npm run build        # Build
npm run start:prod   # Start production
```

## 📊 Check Services

```powershell
# Docker services status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```
