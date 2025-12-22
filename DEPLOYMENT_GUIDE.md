# 🚀 Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide will walk you through deploying your RenewableZmart e-commerce platform.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- Domain name (optional, but recommended)

---

## 🗄️ Part 1: Deploy Database on Render

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in details:
   - **Name**: `renewablezmart-db`
   - **Database**: `ecommerce_db`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier or paid (Free has 90-day limit)
4. Click **"Create Database"**
5. **SAVE these credentials** (you'll need them):
   - Internal Database URL
   - External Database URL
   - PSQL Command
   - Host
   - Port
   - Database
   - Username
   - Password

---

## 🔧 Part 2: Deploy Backend on Render

### Step 1: Push Code to GitHub

If not already done:

```bash
cd "c:\VEMAKT TECH\E-commerce"
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/renewablezmart.git
git push -u origin main
```

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `renewablezmart` repository
5. Configure the service:
   - **Name**: `renewablezmart-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier or paid

### Step 3: Add Environment Variables

In Render, go to **Environment** tab and add these variables:

```env
DATABASE_HOST=<your-render-postgres-host>.oregon-postgres.render.com
DATABASE_PORT=5432
DATABASE_USER=<from-render-db>
DATABASE_PASSWORD=<from-render-db>
DATABASE_NAME=ecommerce_db
DATABASE_SSL=true
DATABASE_SYNC=false

JWT_SECRET=<generate-new-64-char-secret>
JWT_REFRESH_SECRET=<generate-new-64-char-secret>

PORT=4000
FRONTEND_URL=https://your-app-name.vercel.app

NODE_ENV=production

PAYSTACK_SECRET_KEY=sk_live_<your-live-key>

SendGrid_API_Key=SG.<your-sendgrid-key>

ADMIN_EMAIL=admin@yourdomain.com
```

**Generate JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (~5-10 minutes)
3. Your backend URL will be: `https://renewablezmart-backend.onrender.com`
4. **Save this URL** - you'll need it for frontend configuration

### Step 5: Test Backend

Visit: `https://renewablezmart-backend.onrender.com/api/health`

You should see a success message.

---

## 🎨 Part 3: Deploy Frontend on Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables

In Vercel project settings, add:

```env
NEXT_PUBLIC_API_URL=https://renewablezmart-backend.onrender.com/api
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment (~2-5 minutes)
3. Your site will be live at: `https://your-app-name.vercel.app`

---

## 🔄 Part 4: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Open your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your actual Vercel URL:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
5. Save and redeploy

---

## ✅ Part 5: Post-Deployment Checklist

### Test Core Functionality

- [ ] Homepage loads correctly
- [ ] Products display with correct prices
- [ ] User registration works
- [ ] User login works
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Payment integration (Paystack)
- [ ] Admin dashboard access
- [ ] Email notifications
- [ ] Vendor store pages

### Configure Domain (Optional)

#### Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

#### Render (Backend):
1. Go to Service Settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Follow DNS configuration instructions

### Security Checklist

- [ ] All environment variables set correctly
- [ ] `.env` files in `.gitignore`
- [ ] Using HTTPS (both services)
- [ ] JWT secrets are strong and unique
- [ ] Database SSL enabled
- [ ] CORS configured correctly
- [ ] Using live Paystack keys (not test keys)
- [ ] SendGrid API key is production key

---

## 🐛 Troubleshooting

### Backend Issues

**503 Service Unavailable:**
- Render free tier spins down after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up

**Database Connection Failed:**
- Check DATABASE_SSL=true in production
- Verify database credentials
- Ensure database and backend are in same region

**CORS Errors:**
- Update FRONTEND_URL in backend environment variables
- Redeploy backend after changing environment variables

### Frontend Issues

**API Calls Failing:**
- Verify NEXT_PUBLIC_API_URL is correct
- Check if backend is running
- Check browser console for CORS errors

**Build Failures:**
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally first

---

## 📊 Monitoring & Maintenance

### Render (Backend):
- Monitor logs in Render dashboard
- Set up log retention
- Consider upgrading to paid plan for 24/7 uptime

### Vercel (Frontend):
- Monitor analytics in Vercel dashboard
- Check deployment logs for errors
- Set up error tracking (Sentry, LogRocket, etc.)

### Database Maintenance:
- Regular backups (Render does automatic backups)
- Monitor storage usage
- Upgrade if approaching limits

---

## 🚀 Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Push to GitHub** → Triggers automatic deployment
2. **Preview Deployments**: Every pull request gets a preview URL
3. **Production Branch**: Only `main` branch deploys to production

---

## 💰 Cost Estimate

### Free Tier:
- **Vercel**: 100GB bandwidth, unlimited personal projects
- **Render**: 750 hours/month free, but services sleep after 15 min
- **PostgreSQL**: 90 days free, then $7/month

### Recommended Paid (for production):
- **Render Starter**: $7/month (backend + database)
- **Vercel Pro**: $20/month (optional, for team features)
- **Total**: ~$7-27/month

---

## 📞 Support

If you encounter issues:

1. Check deployment logs (Vercel and Render dashboards)
2. Verify all environment variables
3. Test locally first with production-like settings
4. Check firewall/network settings
5. Review this guide step-by-step

---

## 🎉 Success!

Once everything is deployed and tested:

1. Share your live URL with users
2. Monitor for any errors in first 24 hours
3. Set up uptime monitoring (UptimeRobot, Pingdom)
4. Configure analytics (Google Analytics, Plausible)
5. Set up error tracking

**Your live URLs:**
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://renewablezmart-backend.onrender.com`

Congratulations! Your e-commerce platform is now live! 🎊
