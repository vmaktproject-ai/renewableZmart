# RenewableZmart - Quick Deployment Steps

## 🎯 Quick Start (5 Steps)

### 1️⃣ Create Database on Render (5 min)
1. Go to https://dashboard.render.com/
2. New + → PostgreSQL
3. Name: `renewablezmart-db`, Save credentials

### 2️⃣ Deploy Backend on Render (10 min)
1. New + → Web Service
2. Connect GitHub repo
3. Root Directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Add environment variables from `backend/.env.example`
7. Deploy!

### 3️⃣ Deploy Frontend on Vercel (5 min)
1. Go to https://vercel.com/new
2. Import GitHub repo
3. Root Directory: `./`
4. Add env: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api`
5. Deploy!

### 4️⃣ Update Backend CORS (2 min)
1. Go to Render backend service
2. Environment → Update `FRONTEND_URL` with your Vercel URL
3. Redeploy

### 5️⃣ Test Everything (5 min)
- Visit your Vercel URL
- Test registration, login, products
- Test checkout and payment

## 📝 Important Files Created

- ✅ `vercel.json` - Vercel configuration
- ✅ `backend/.env.example` - Backend environment template
- ✅ `DEPLOYMENT_GUIDE.md` - Detailed deployment guide

## 🔑 Remember to:

- [ ] Generate new JWT secrets for production
- [ ] Use LIVE Paystack keys (not test)
- [ ] Update database to production credentials
- [ ] Set DATABASE_SSL=true for Render
- [ ] Update FRONTEND_URL after Vercel deployment

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for complete step-by-step instructions.

---

**Need help?** Check the troubleshooting section in DEPLOYMENT_GUIDE.md
