# Quick Setup: Paystack BVN Verification

## 1. Get Your Paystack API Key

1. Visit [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

## 2. Add to Environment Variables

Open `backend/.env` and add:
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

**Replace** `sk_test_your_secret_key_here` with your actual key.

## 3. Restart Backend Server

```bash
cd backend
npm run dev
```

## 4. Test It!

1. Go to http://localhost:3000/cart
2. Add products (minimum ₦50,000)
3. Select "Pay Small Small" payment option
4. Enter test BVN: `22123456789`
5. Click "Verify" button
6. ✓ Form auto-fills with verified information!

## What Happens

### When BVN is Verified:
✅ Full name auto-filled from BVN records  
✅ Phone number auto-filled  
✅ Green verification badge shown  
✅ BVN photo displayed (if available)  
✅ Verified fields locked from editing  

### Security Features:
🔒 BVN validated against Paystack database  
🔒 Name matching verified  
🔒 Blacklist checked automatically  
🔒 Backend validates before saving  

## Test Mode vs Production

### Test Mode (Development)
- Use `sk_test_` key
- Any 11-digit BVN works
- Example: `22123456789`
- Free unlimited requests

### Production (Live)
- Use `sk_live_` key
- Only real Nigerian BVNs work
- Must complete Paystack business verification
- Enable Identity Verification in dashboard

## Next Steps

For full documentation, see [BVN_VERIFICATION_SYSTEM.md](BVN_VERIFICATION_SYSTEM.md)

For Paystack payment setup, see [PAYSTACK_SETUP.md](PAYSTACK_SETUP.md)
