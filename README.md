# 🌱 RenewableZmart - Sustainable Energy E-commerce Platform

A modern, Jumia-inspired e-commerce platform for sustainable energy products built with **Next.js 14**, **Express.js**, **PostgreSQL**, and **TypeORM**.

## 🏗️ Architecture

### Frontend (Next.js 14 + TypeScript)
- **Framework**: Next.js 14 with TypeScript
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS
- **API Client**: Axios with auth interceptors

### Backend (Express.js + TypeScript)
- **Framework**: Express.js with TypeORM
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Search**: Meilisearch
- **Auth**: JWT with refresh tokens
- **Payments**: Paystack
- **Docs**: Swagger/OpenAPI

## ✨ Key Features
✅ JWT Authentication with refresh tokens  
✅ Product catalog with advanced search  
✅ Shopping cart & checkout  
✅ Order management system  
✅ Paystack payment integration  
✅ Meilisearch for fast search  
✅ Redis caching  
✅ Role-based access control  
✅ RESTful API with Swagger docs  
✅ Docker for local development  

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for databases)

### 1. Install Dependencies

```powershell
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 2. Start Infrastructure (Docker)

```powershell
# Start PostgreSQL, Redis, and Meilisearch
docker-compose up -d

# Check services are running
docker-compose ps
```

### 3. Run Backend

```powershell
cd backend
npm run start:dev
```

Backend will run at http://localhost:4000  
Swagger API docs at http://localhost:4000/api/docs

### 4. Run Frontend

```powershell
# In a new terminal
npm run dev
```

Frontend will run at http://localhost:3000

## 📚 API Endpoints

**Auth:**
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- POST `/api/auth/refresh` - Refresh token

**Products:**
- GET `/api/products` - List all products
- GET `/api/products/:id` - Get product
- GET `/api/products/search?q=term` - Search

**Orders:**
- POST `/api/orders` - Create order
- GET `/api/orders/my-orders` - User's orders

**Payments:**
- POST `/api/payments/initialize` - Start payment
- GET `/api/payments/verify/:ref` - Verify payment

Full docs: http://localhost:4000/api/docs

## 🗂️ Project Structure

```
E-commerce/
├── frontend (Next.js)
│   ├── components/     # React components
│   ├── pages/         # Next.js pages
│   ├── lib/           # API client & services
│   ├── types/         # TypeScript types
│   └── styles/        # Tailwind CSS
│
├── backend (Express.js)
│   └── src/
│       ├── modules/
│       │   ├── auth/      # Authentication
│       │   ├── users/     # User management
│       │   ├── products/  # Products
│       │   ├── orders/    # Orders
│       │   ├── payments/  # Paystack
│       │   └── search/    # Meilisearch
│       └── main.ts
│
└── docker-compose.yml # Infrastructure
```

## 💳 Paystack Setup

1. Get API keys from https://dashboard.paystack.com
2. Add to `.env.local`:
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
```
3. Add to `backend/.env`:
```env
PAYSTACK_SECRET_KEY=sk_test_xxx
```

## 📱 Mobile App (React Native)

This architecture supports React Native mobile apps:
- Shared TypeScript types
- Reusable API services
- Same backend

## 🚢 Production Deployment

**Frontend:** Vercel  
**Backend:** Railway/Render/DigitalOcean  
**Database:** Managed PostgreSQL (AWS RDS, Supabase)  
**Redis:** Redis Cloud/Upstash  
**Search:** Meilisearch Cloud  

## 🛡️ Security

- JWT auth with refresh tokens
- Bcrypt password hashing
- CORS configuration
- Input validation
- SQL injection protection

## 📊 Performance

- Server-side rendering (SSR)
- Redis caching
- Database query optimization
- Meilisearch for instant search
- CDN-ready static assets

## 🧪 Testing

```powershell
# Frontend
npm run test

# Backend
cd backend
npm run test
```

---

**Enterprise-grade e-commerce built with modern tech stack**
