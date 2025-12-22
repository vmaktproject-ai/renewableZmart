# 🚀 Pre-Deployment Checklist

Before deploying to production, ensure all these items are completed:

## 🔒 Security

- [ ] All `.env` files are in `.gitignore`
- [ ] Generate NEW JWT secrets for production (never use dev secrets)
- [ ] Use LIVE Paystack keys (remove all test keys)
- [ ] Use production SendGrid API key
- [ ] Set strong database password
- [ ] Enable DATABASE_SSL=true in production
- [ ] Remove any console.log with sensitive data
- [ ] Remove any hardcoded credentials

## 📦 Code Quality

- [ ] Run `npm run build` successfully for frontend
- [ ] Run `npm run build` successfully for backend
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All tests passing (if any)
- [ ] Remove debug code
- [ ] Remove unused dependencies

## 🗄️ Database

- [ ] Database created on Render
- [ ] Database credentials saved securely
- [ ] Set DATABASE_SYNC=false (for production)
- [ ] Backup strategy in place
- [ ] Database migrations ready (if applicable)

## 🌐 Frontend (Vercel)

- [ ] `vercel.json` file created
- [ ] NEXT_PUBLIC_API_URL env variable ready
- [ ] Build command correct: `npm run build`
- [ ] GitHub repo connected
- [ ] Domain name ready (optional)

## ⚙️ Backend (Render)

- [ ] Root directory set to `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] All environment variables configured
- [ ] PORT=4000 set
- [ ] FRONTEND_URL ready to update after Vercel deployment

## 🔗 Integrations

- [ ] Paystack account verified
- [ ] Paystack live keys obtained
- [ ] SendGrid account set up
- [ ] SendGrid sender verified
- [ ] Email templates tested
- [ ] Payment webhooks configured

## 📱 Testing Checklist (Post-Deployment)

After deployment, test these features:

- [ ] Homepage loads
- [ ] User registration
- [ ] Email verification (if enabled)
- [ ] User login
- [ ] Browse products
- [ ] Search functionality
- [ ] Filter products
- [ ] View product details
- [ ] Add to cart
- [ ] View cart
- [ ] Update cart quantities
- [ ] Remove from cart
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order confirmation
- [ ] Order tracking
- [ ] User account page
- [ ] Admin dashboard
- [ ] Vendor dashboard
- [ ] Product approval workflow
- [ ] Store pages

## 🔧 Configuration Files

Required files:
- [x] `vercel.json` - Vercel configuration
- [x] `backend/.env.example` - Environment template
- [x] `.gitignore` - Git ignore rules
- [x] `DEPLOYMENT_GUIDE.md` - Deployment instructions

## 📊 Monitoring Setup (After Deployment)

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring (UptimeRobot)
- [ ] Set up analytics (Google Analytics)
- [ ] Enable Vercel Analytics
- [ ] Monitor Render logs
- [ ] Set up alerting for errors

## 💳 Payment Configuration

- [ ] Test mode disabled
- [ ] Live Paystack keys configured
- [ ] Webhook URL configured in Paystack
- [ ] Test small transaction
- [ ] Verify payment confirmation emails

## 📧 Email Configuration

- [ ] SendGrid sender verified
- [ ] Welcome email template
- [ ] Order confirmation template
- [ ] Password reset template
- [ ] Admin notification template
- [ ] Test emails in production

## 🌍 CORS & Security Headers

- [ ] FRONTEND_URL correctly set in backend
- [ ] CORS configured for production domain
- [ ] Security headers enabled
- [ ] HTTPS enforced
- [ ] Rate limiting configured

## 🚦 Performance

- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] API response times acceptable
- [ ] Database indexes created
- [ ] Caching strategy in place

## 📝 Documentation

- [ ] README.md updated with live URLs
- [ ] API documentation (if public)
- [ ] Admin user guide
- [ ] Vendor user guide
- [ ] Customer support resources

## ✅ Final Steps

1. Review all checklist items
2. Deploy backend first
3. Deploy frontend second
4. Update FRONTEND_URL in backend
5. Test all critical paths
6. Monitor logs for 24 hours
7. Announce launch! 🎉

---

## 🆘 Emergency Rollback Plan

If something goes wrong:

### Vercel:
1. Go to Deployments
2. Click on previous successful deployment
3. Click "Promote to Production"

### Render:
1. Go to service settings
2. Click "Manual Deploy"
3. Select previous commit

### Database:
1. Use Render's automatic backups
2. Restore from backup if needed

---

**Once all items are checked, you're ready to deploy!** 🚀
