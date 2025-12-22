# Paystack Payment Integration Setup

## Overview
Real Paystack payment integration has been implemented for the checkout flow.

## Setup Instructions

### 1. Get Your Paystack API Keys

1. Create a Paystack account at https://paystack.com
2. Log in to your Paystack Dashboard
3. Go to Settings > API Keys & Webhooks
4. Copy your **Public Key** (starts with `pk_test_`) and **Secret Key** (starts with `sk_test_`)

### 2. Configure Backend

Edit `backend/.env` and update these values:

```env
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Configure Frontend

Edit `.env.local` in the project root and update:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Important:** Restart your development servers after updating environment variables!

### 4. Test Payment Flow

#### Test Card Details (Paystack Test Mode):
- **Card Number:** 4084084084084081
- **CVV:** 408
- **Expiry:** Any future date (e.g., 12/25)
- **PIN:** 0000

#### Test Flow:
1. Add products to cart
2. Click "Proceed to Checkout"
3. Paystack payment popup appears
4. Enter test card details
5. Complete payment
6. You'll be redirected to the callback page
7. Payment is verified with Paystack API
8. Order status updates to "paid"

### 5. Payment Flow Architecture

```
Cart Page (cart.tsx)
    ↓
User clicks "Proceed to Checkout"
    ↓
Frontend calls: POST /api/payments/initialize
    ↓
Backend initializes Paystack transaction
    ↓
Returns: authorization_url & reference
    ↓
Paystack popup opens in browser
    ↓
User completes payment
    ↓
Paystack redirects to: /payment/callback?reference=xxx
    ↓
Callback page calls: POST /api/payments/verify
    ↓
Backend verifies with Paystack API
    ↓
Updates order paymentStatus to 'paid'
    ↓
Cart cleared, success message shown
```

### 6. API Endpoints

#### Initialize Payment
```
POST http://localhost:5000/api/payments/initialize
Authorization: Bearer <jwt_token>

Body:
{
  "amount": 50000,
  "email": "customer@example.com",
  "metadata": {
    "cart_items": [...],
    "customer_name": "John Doe",
    "shipping_amount": 2500
  }
}

Response:
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxx",
    "access_code": "xxx",
    "reference": "xxx"
  }
}
```

#### Verify Payment
```
POST http://localhost:5000/api/payments/verify
Authorization: Bearer <jwt_token>

Body:
{
  "reference": "paystack_reference_xxx"
}

Response:
{
  "success": true,
  "data": {
    "status": "success",
    "reference": "xxx",
    "amount": 5000000,
    "message": "Payment verified successfully"
  }
}
```

### 7. Go Live Checklist

When ready for production:

1. Switch to **Live API Keys** in Paystack Dashboard
2. Update both `.env` files with live keys (starting with `pk_live_` and `sk_live_`)
3. Update `FRONTEND_URL` to your production domain
4. Set up Paystack webhooks for order status updates
5. Implement proper error handling and logging
6. Test with small real transactions first

### 8. Security Notes

- ✅ Secret keys are stored in `.env` files (never commit these!)
- ✅ Public keys are safe to expose in frontend
- ✅ Payment verification happens on backend
- ✅ JWT authentication required for payment endpoints
- ✅ Amount converted to kobo (smallest currency unit)
- ✅ Transaction reference validated with Paystack API

### 9. Currency Support

Currently configured for **Nigerian Naira (NGN)**. Amounts are automatically converted to kobo (1 NGN = 100 kobo) before sending to Paystack.

### 10. Troubleshooting

**Payment popup not showing:**
- Check browser console for errors
- Ensure Paystack script loaded (check Network tab)
- Verify `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set

**Payment initialization fails:**
- Check backend console logs
- Verify `PAYSTACK_SECRET_KEY` is correct
- Ensure user is authenticated (JWT token present)

**Payment verification fails:**
- Check payment reference is correct
- Verify backend can reach Paystack API
- Check for network/firewall issues

**"Payment system is loading":**
- Paystack inline.js script still loading
- Check internet connection
- Try refreshing the page

### 11. Files Modified

- `backend/src/controllers/paymentController.ts` - Real Paystack API integration
- `backend/.env` - Paystack secret keys
- `pages/cart.tsx` - Checkout button triggers Paystack popup
- `pages/payment/callback.tsx` - Post-payment verification page
- `.env.local` - Frontend Paystack public key

### 12. Next Steps

- [ ] Set up Paystack webhooks for async order updates
- [ ] Add payment history page for customers
- [ ] Implement refund functionality
- [ ] Add email notifications for successful payments
- [ ] Create admin dashboard for payment analytics
- [ ] Handle failed payments with retry mechanism
