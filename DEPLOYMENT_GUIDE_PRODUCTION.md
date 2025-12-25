# 🚀 Live Deployment Guide for RenewableZmart

## Deployment Options

### **Option 1: Render.com (Recommended - Already Configured)**

Render.com provides free tier with good performance. The `render.yaml` is already configured.

#### Steps:

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub account

2. **Connect Repository**
   - Click "New +"
   - Select "Blueprint"
   - Paste your GitHub repo URL
   - Click "Connect"

3. **Deploy**
   - Render will automatically detect `render.yaml`
   - Configure environment variables:
     - `NEXT_PUBLIC_API_URL`: Production backend URL
     - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Your Paystack public key
     - `JWT_SECRET`: Generate a strong secret
     - `PAYSTACK_SECRET_KEY`: Your Paystack secret
     - `SendGrid_API_Key`: Your SendGrid API key

4. **Database Setup**
   - Render will create PostgreSQL database automatically
   - Connection details auto-injected from `render.yaml`

### **Option 2: Vercel (Next.js Native)**

Vercel is optimized for Next.js applications.

#### Steps:

1. **Connect Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your Git repository
   - Select Next.js framework

2. **Environment Variables**
   - Add in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
   ```

3. **Deploy Backend Separately**
   - Use Render for backend (as configured)
   - Frontend goes to Vercel

### **Option 3: Docker + AWS/DigitalOcean**

For more control and scalability.

#### Steps:

1. **Build Docker Images**
   ```bash
   docker-compose -f docker-compose.yml up --build
   ```

2. **Push to Registry**
   - Docker Hub or AWS ECR

3. **Deploy to Hosting**
   - AWS ECS
   - DigitalOcean App Platform
   - AWS Lightsail

## Pre-Deployment Checklist

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_YOUR_KEY
```

### Backend (.env production)
```env
NODE_ENV=production
PORT=4000
DATABASE_HOST=your_db_host
DATABASE_PORT=5432
DATABASE_NAME=ecommerce_db
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_SSL=true
JWT_SECRET=generate-a-strong-secret
JWT_REFRESH_SECRET=generate-another-secret
PAYSTACK_SECRET_KEY=sk_live_YOUR_KEY
SendGrid_API_Key=your_sendgrid_key
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_EMAIL=your_admin_email
```

## Quick Deployment with Render

### Step 1: Prepare Repository
```bash
# Ensure git is initialized
git init
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Connect to Render
1. Go to https://render.com/dashboard
2. Click "New +"
3. Select "Blueprint"
4. Paste your GitHub URL
5. Follow prompts

### Step 3: Configure Environment
In Render Dashboard → Backend Service → Environment:
- `NODE_ENV` = production
- `JWT_SECRET` = (generate with: `openssl rand -hex 32`)
- `PAYSTACK_SECRET_KEY` = (from Paystack account)
- `SendGrid_API_Key` = (from SendGrid account)
- `FRONTEND_URL` = (your frontend Vercel URL)

### Step 4: Deploy Frontend to Vercel
1. Go to https://vercel.com
2. Import repository
3. Set environment:
   - `NEXT_PUBLIC_API_URL` = Render backend URL
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` = Your key

## Domain Configuration

### Set Up Custom Domain

1. **Backend (Render)**
   - Render Dashboard → Settings → Custom Domain
   - Add your backend domain (e.g., api.renewablezmart.com)
   - Point DNS to Render

2. **Frontend (Vercel)**
   - Project Settings → Domains
   - Add custom domain (e.g., www.renewablezmart.com)
   - Point DNS to Vercel

### DNS Setup
```
For renewablezmart.com:

api.renewablezmart.com  → CNAME → your-render-backend.onrender.com
www.renewablezmart.com  → CNAME → your-vercel-frontend.vercel.app
```

## SSL/HTTPS

- **Vercel**: Automatic SSL with Let's Encrypt ✅
- **Render**: Automatic SSL with Let's Encrypt ✅
- **Custom Domain**: Automatic SSL if using nameservers ✅

## Monitoring

### Render
- Dashboard → Backend Service → Logs
- Monitor build and runtime logs
- Check health endpoint: `/api/health`

### Vercel
- Dashboard → Deployments
- Monitor build logs and errors
- Real-time analytics

## Scaling

### As Traffic Grows

**Vercel Frontend**
- Auto-scales automatically

**Render Backend**
- Upgrade from Starter to Standard plan
- Add more resources

**Database**
- Render PostgreSQL auto-scales
- Or migrate to managed RDS

## Troubleshooting

### Backend 500 Errors
1. Check logs: `Render Dashboard → Logs`
2. Verify environment variables
3. Check database connection
4. Verify API keys (Paystack, SendGrid)

### Frontend Not Loading
1. Check build logs in Vercel
2. Verify `NEXT_PUBLIC_API_URL` set correctly
3. Check CORS headers in backend

### Image Not Loading
- Verify backend `/uploads` endpoint accessible
- Check CORS headers
- Ensure images exist in production uploads

## Cost Estimation (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Frontend) | Pro | $20 |
| Render (Backend) | Standard | $20 |
| PostgreSQL | Starter | Free-$7 |
| SendGrid | Free | $0 (up to 100/day) |
| Paystack | Free | 1.5% per transaction |
| **Total** | | ~$40/month |

## Post-Deployment

1. **Test Everything**
   - Products load ✓
   - Images display ✓
   - Checkout works ✓
   - Payments process ✓

2. **Monitor Performance**
   - Check load times
   - Monitor error rates
   - Track user sessions

3. **Security**
   - Enable HTTPS (automatic)
   - Set security headers
   - Monitor for vulnerabilities
   - Regular backups

4. **Analytics**
   - Set up Google Analytics
   - Monitor Paystack transactions
   - Track user behavior

## Rollback Plan

If issues occur:
1. Vercel → Previous successful build
2. Render → Revert to previous deployment
3. Database → Automated daily backups

## Support & Help

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Paystack Support**: support@paystack.com
