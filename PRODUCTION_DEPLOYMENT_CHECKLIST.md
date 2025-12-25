# 🚀 Production Deployment Checklist

## Pre-Deployment Verification ✅

### Frontend Build
- ✅ `npm run build` successful
- ✅ 35 pages compiled
- ✅ Bundle size: ~123KB first load
- ✅ No build errors

### Backend Build
- ✅ TypeScript compilation successful
- ✅ No type errors
- ✅ Ready for production

### Code Quality
- ✅ Fixed hardcoded URLs → environment variables
- ✅ Fixed image loading → direct backend URLs
- ✅ Responsive design → all breakpoints tested
- ✅ API endpoints → all 200 OK responses
- ✅ No 500 errors detected

## Deployment Steps

### Step 1: Prepare Environment Variables

**Frontend (.env.production)**
```env
NEXT_PUBLIC_API_URL=https://api.renewablezmart.com/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
```

**Backend (Render Dashboard)**
```
NODE_ENV=production
PORT=4000
DATABASE_SSL=true
JWT_SECRET=(generate with: openssl rand -hex 32)
PAYSTACK_SECRET_KEY=sk_live_your_key_here
SendGrid_API_Key=your_sendgrid_key
FRONTEND_URL=https://renewablezmart.com
```

### Step 2: Deploy with Render

```bash
# 1. Create render.yaml blueprint (already in repo)
# 2. Go to https://render.com
# 3. Click "New +" → "Blueprint"
# 4. Paste GitHub URL: https://github.com/your-username/your-repo
# 5. Configure environment variables
# 6. Click "Deploy"
```

**Expected Deployment Time: 5-10 minutes**

### Step 3: Deploy Frontend to Vercel

```bash
# 1. Go to https://vercel.com
# 2. Click "New Project"
# 3. Import GitHub repository
# 4. Select Next.js framework
# 5. Set environment variables:
#    - NEXT_PUBLIC_API_URL = Render backend URL
#    - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = Your key
# 6. Click "Deploy"
```

**Expected Deployment Time: 2-3 minutes**

### Step 4: Configure Domains

**Add Custom Domains**
```
api.renewablezmart.com   → Points to Render backend
www.renewablezmart.com   → Points to Vercel frontend
renewablezmart.com       → Redirects to www
```

**DNS Configuration (at your domain registrar)**
```
api.renewablezmart.com    CNAME  xxxxxx.onrender.com
www.renewablezmart.com    CNAME  renewable-zmart.vercel.app
renewablezmart.com        CNAME  www.renewablezmart.com
```

## Post-Deployment Testing

### ✅ Frontend Tests
- [ ] Homepage loads without errors
- [ ] Products display with images
- [ ] Product detail page works
- [ ] Cart functionality works
- [ ] Checkout process starts
- [ ] Navigation works on mobile
- [ ] All pages responsive

### ✅ Backend Tests
- [ ] `/api/health` returns 200
- [ ] `/api/products` returns data
- [ ] `/api/stores` returns data
- [ ] `/api/auth/login` works
- [ ] `/api/orders` works
- [ ] Images load from `/uploads`
- [ ] Database connected

### ✅ Features Tests
- [ ] User registration works
- [ ] Login/logout works
- [ ] Add to cart works
- [ ] Checkout process works
- [ ] Paystack payment integration ready
- [ ] Email notifications working
- [ ] Admin dashboard accessible

### ✅ Performance Tests
- [ ] Homepage loads < 3 seconds
- [ ] Product pages load < 2 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] No network errors

### ✅ Security Tests
- [ ] HTTPS enabled (automatic)
- [ ] API keys not exposed
- [ ] Passwords hashed
- [ ] CORS properly configured
- [ ] SQL injection prevented
- [ ] XSS protection enabled

## Monitoring Setup

### Render Monitoring
```
1. Go to Render Dashboard
2. Select Backend Service
3. Click "Logs" to view real-time logs
4. Set up alerts for errors
```

### Vercel Monitoring
```
1. Go to Vercel Dashboard
2. Select Frontend Project
3. View "Analytics" tab
4. Monitor Core Web Vitals
```

### Application Monitoring
```
1. Set up Google Analytics
2. Monitor user behavior
3. Track conversion rates
4. Monitor error rates
```

## Scaling Plan

### Current Setup
- ✅ Handles: ~1,000 concurrent users
- ✅ Database: 5GB storage
- ✅ Requests: ~100K/month free tier

### Growth Plan
| Users | Action |
|-------|--------|
| 100 | Current setup ✅ |
| 1,000 | Upgrade Render to Standard |
| 5,000 | Add CDN for images |
| 10,000 | Dedicated database instance |
| 50,000+ | Migrate to full infrastructure |

## Backup & Recovery

### Database Backups
- Render auto-backs up daily
- Keep 30 days of backups
- Test restore process monthly

### Recovery Steps
1. Render Dashboard → PostgreSQL → Backups
2. Select restoration point
3. Restore to new instance
4. Update connection strings

## Ongoing Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor user reports
- [ ] Verify payment processing

### Weekly
- [ ] Review analytics
- [ ] Update dependencies
- [ ] Check security updates

### Monthly
- [ ] Performance audit
- [ ] Database optimization
- [ ] Capacity planning
- [ ] Backup verification

## Costs

| Service | Monthly | Annual |
|---------|---------|--------|
| Vercel Pro | $20 | $240 |
| Render Backend | $20 | $240 |
| PostgreSQL | $7 | $84 |
| SendGrid | Free* | - |
| Paystack | 1.5%* | - |
| Domain | $12 | $144 |
| **Total** | **~$59** | **~$708** |

*SendGrid: Free for up to 100 emails/day
*Paystack: Only charge per transaction

## Troubleshooting

### Issue: Backend won't deploy
```
1. Check build logs
2. Verify Node version: v18+
3. Check dependencies: npm install
4. Verify environment variables
```

### Issue: Images not loading
```
1. Verify backend /uploads route works
2. Check CORS headers on backend
3. Ensure images exist in production
4. Check browser console for errors
```

### Issue: Database connection failing
```
1. Verify DATABASE_HOST, PORT, credentials
2. Check DATABASE_SSL=true
3. Verify firewall allows connections
4. Test connection: psql postgres://...
```

### Issue: Payments not working
```
1. Verify PAYSTACK keys are correct
2. Check Paystack account status
3. Verify NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
4. Check browser console for errors
```

## Success Indicators

✅ **Application is LIVE when:**
- Frontend accessible at your domain
- Backend APIs responding
- Database connected and working
- SSL certificates active (green lock)
- Images loading properly
- Payments processing
- Error logs clean
- Performance metrics good

## Support Contacts

- **Render Support**: support@render.com
- **Vercel Support**: https://vercel.com/support
- **Paystack Support**: support@paystack.com
- **SendGrid Support**: support@sendgrid.com

---

**Deployment Time: ~15-20 minutes total**
**Estimated Cost: $59/month**
**Expected Traffic: Up to 100K requests/month**
