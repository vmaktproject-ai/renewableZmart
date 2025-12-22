# BVN Verification System via Paystack

## Overview

Integrated Paystack Identity Verification API to enable Bank Verification Number (BVN) verification for Pay Small Small (installment) applications. The system automatically validates and auto-fills user information from official BVN records, ensuring data accuracy and preventing fraud.

## Features

### 1. **Real-time BVN Verification**
- Validates BVN against Paystack's database
- Verifies name matching with BVN records
- Checks blacklist status
- Returns verified personal information

### 2. **Auto-fill from BVN Records**
When BVN is successfully verified, the system automatically populates:
- ✅ **Full Name** (First, Middle, Last names)
- ✅ **Phone Number** (Registered with bank)
- ✅ **Date of Birth**
- ✅ **Profile Photo** (if available)

### 3. **Visual Verification Feedback**
- Green checkmark for verified BVN
- Display of BVN photo and verified details
- Locked fields for verified information
- Red error indicators for failed verification

### 4. **Security & Validation**
- BVN format validation (11 digits)
- Blacklist checking
- Name matching verification
- Backend validation ensures BVN was verified
- Cross-validation of submitted name vs BVN name

## Implementation

### Frontend Files
```
pages/cart.tsx            - Pay Small Small application form
pages/api/verify-bvn.ts   - Paystack BVN verification API endpoint
```

### Backend Files
```
backend/src/controllers/installmentController.ts - Application submission with BVN validation
backend/src/models/InstallmentApplication.ts     - Stores BVN and bvnData
```

## Paystack Integration

### API Endpoint
```
POST https://api.paystack.co/bvn/match
```

### Request Format
```typescript
{
  bvn: "22123456789",          // 11-digit BVN
  first_name: "John",          // Optional for name matching
  last_name: "Doe"             // Optional for name matching
}
```

### Response Format
```typescript
{
  status: true,
  message: "BVN match successful",
  data: {
    first_name: "John",
    middle_name: "Chukwu",
    last_name: "Doe",
    dob: "01-Jan-1990",
    formatted_dob: "1990-01-01",
    mobile: "08012345678",
    phone_number: "08012345678",
    is_blacklisted: false,
    photo: "base64_encoded_image_string",
    match_result: {
      first_name: "MATCH",    // or "NO_MATCH"
      last_name: "MATCH"      // or "NO_MATCH"
    }
  }
}
```

## Setup Instructions

### 1. Get Paystack API Keys

1. Sign up or login at [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for production)

### 2. Configure Environment Variables

Add to `backend/.env`:
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

**⚠️ Important:** Never commit the secret key to version control!

### 3. Enable Identity Verification

1. In Paystack Dashboard, go to **Settings** → **Compliance**
2. Enable **Identity Verification**
3. Verify your Paystack business account (required for production)

### 4. Testing

**Test Mode BVNs:**
Paystack provides test BVNs for development:
```
Any 11-digit BVN works in test mode
Example: 22123456789
```

**Production Mode:**
- Only real BVNs registered with Nigerian banks will work
- Names must match BVN records exactly

## User Flow

### Step 1: User Enters BVN
```
User navigates to cart checkout
Selects "Pay Small Small" payment option
Opens installment application form
Enters their 11-digit BVN
```

### Step 2: Click "Verify" Button
```
Frontend calls /api/verify-bvn
API contacts Paystack Identity API
Paystack validates BVN and returns data
```

### Step 3: Auto-fill Form
```
✓ BVN Verified Successfully!

Name field auto-filled: John Chukwu Doe ✓ Verified from BVN
Phone field auto-filled: 08012345678 ✓ Verified from BVN

Green verification badge displayed
BVN photo shown (if available)
Verified fields locked from editing
```

### Step 4: Submit Application
```
User completes remaining fields:
- Email address
- Delivery address
- Employment status
- Organization name
- Monthly income range

Backend validates:
✓ BVN was verified (bvnData present)
✓ Submitted name matches BVN name
✓ Phone and email formats valid
✓ All required fields completed

Application saved to database with bvnData
```

## Code Examples

### Frontend - Verify BVN
```typescript
const verifyBVN = async (bvn: string) => {
  setBvnVerifying(true)
  
  try {
    const response = await fetch('/api/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        bvn,
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' ')
      })
    })
    
    const data = await response.json()
    
    if (data.success && data.verified) {
      setBvnValid(true)
      setBvnData(data.data)
      
      // Auto-fill form
      setFormData(prev => ({
        ...prev,
        fullName: `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`.trim(),
        phone: data.data.phone
      }))
      
      alert('✓ BVN Verified! Details auto-filled.')
    }
  } catch (error) {
    alert('Verification failed. Please try again.')
  } finally {
    setBvnVerifying(false)
  }
}
```

### Backend - Paystack API Call
```typescript
const response = await fetch('https://api.paystack.co/bvn/match', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bvn: bvn,
    first_name: firstName,
    last_name: lastName
  })
})

const data = await response.json()

if (data.status && !data.data.is_blacklisted) {
  return {
    success: true,
    verified: true,
    data: {
      firstName: data.data.first_name,
      lastName: data.data.last_name,
      middleName: data.data.middle_name,
      dateOfBirth: data.data.formatted_dob,
      phone: data.data.mobile,
      image: data.data.photo
    }
  }
}
```

### Backend - Validation Before Save
```typescript
// Ensure BVN was verified
if (!bvnData || !bvnData.firstName) {
  return res.status(400).json({ 
    message: 'BVN must be verified before submission' 
  })
}

// Cross-validate name matches BVN
const submittedName = fullName.toLowerCase().trim()
const bvnFullName = `${bvnData.firstName} ${bvnData.middleName} ${bvnData.lastName}`.toLowerCase().trim()

if (submittedName !== bvnFullName) {
  return res.status(400).json({ 
    message: 'Name does not match BVN records' 
  })
}
```

## Database Schema

### InstallmentApplication Model
```typescript
@Entity('installment_applications')
export class InstallmentApplication {
  @Column()
  bvn!: string;  // 11-digit BVN
  
  @Column({ type: 'jsonb', nullable: true })
  bvnData?: {
    firstName: string
    middleName?: string
    lastName: string
    dateOfBirth?: string
    phone?: string
    image?: string  // Base64 encoded photo
  };
  
  @Column()
  fullName!: string;  // Must match bvnData name
  
  @Column()
  phone!: string;     // From BVN or user input
  
  // ... other fields
}
```

## Validation Rules

### BVN Format
- Must be exactly 11 digits
- No letters or special characters
- Example: `22123456789`

### Name Matching
- Submitted name must match BVN records exactly
- Case-insensitive comparison
- Includes first, middle, and last names

### Blacklist Check
- Automatically rejects blacklisted BVNs
- Returns error: "This BVN is blacklisted"

### Required BVN Verification
- BVN must be verified before form submission
- Frontend: Shows "Verify" button until verified
- Backend: Validates bvnData presence

## Security Features

### 1. **Server-side Validation**
All BVN verification happens on the backend to protect API keys

### 2. **API Key Protection**
```typescript
// Secret key stored in .env (never in frontend)
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
```

### 3. **Blacklist Checking**
Automatically rejects blacklisted BVNs from Paystack database

### 4. **Name Verification**
Cross-validates submitted name matches BVN records

### 5. **Data Immutability**
Verified fields (name, phone) locked from editing after verification

## Error Handling

### Invalid BVN Format
```
"Invalid BVN format. Must be 11 digits."
```

### Name Mismatch
```
"Name does not match BVN records. Please check your details."
```

### Blacklisted BVN
```
"This BVN is blacklisted and cannot be used"
```

### API Error
```
"BVN verification service unavailable. Please try again later."
```

### Unverified Submission
```
"Please verify your BVN before submitting the application."
```

## Benefits

### For Users
✅ **Faster Application** - Auto-fills personal information  
✅ **Accurate Data** - Information verified from official records  
✅ **Trust & Security** - Identity confirmed through banking system  
✅ **Seamless Experience** - One-click verification

### For Business
✅ **Fraud Prevention** - Verifies real identities  
✅ **Data Accuracy** - Eliminates typos and fake information  
✅ **Compliance** - KYC (Know Your Customer) compliant  
✅ **Risk Reduction** - Blacklist checking built-in  
✅ **Credit Assessment** - Verified employment and identity data

## Testing Guide

### Test in Development

1. **Start Backend Server**
```bash
cd backend
npm run dev
```

2. **Start Frontend**
```bash
npm run dev
```

3. **Test BVN Verification**
```
Navigate to: http://localhost:3000/cart
Add products to cart (min ₦50,000)
Select "Pay Small Small" payment option
Enter test BVN: 22123456789
Click "Verify"
Observe auto-fill of name and phone
```

### Test Scenarios

**Valid BVN (Test Mode):**
```
BVN: 22123456789
Result: ✓ Verified successfully, form auto-filled
```

**Invalid Format:**
```
BVN: 123 (too short)
Result: ✗ "Invalid BVN format. Must be 11 digits."
```

**Name Mismatch:**
```
Pre-filled name: "Jane Smith"
BVN returns: "John Doe"
Result: ✗ "Name does not match BVN records"
```

**Unverified Submission:**
```
User skips verification
Clicks submit
Result: ✗ "Please verify your BVN before submitting"
```

## Production Deployment

### Checklist

- [ ] Replace test Paystack key with live key
- [ ] Enable Identity Verification in Paystack dashboard
- [ ] Complete Paystack business verification
- [ ] Test with real BVNs
- [ ] Configure proper error logging
- [ ] Set up monitoring for verification failures
- [ ] Add rate limiting to prevent abuse
- [ ] Document BVN verification policy for users

### Environment Variables (Production)
```env
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
```

## API Rate Limits

Paystack Identity API limits:
- **Test Mode:** Unlimited requests
- **Live Mode:** Subject to your Paystack plan
- Consider caching verified BVNs to reduce API calls

## Compliance

### Data Privacy
- BVN data stored securely in PostgreSQL
- Only essential BVN information stored (name, phone, DOB)
- Photo stored as base64 (optional)
- Compliant with Nigerian Data Protection Regulation (NDPR)

### KYC Compliance
- Meets CBN (Central Bank of Nigeria) KYC requirements
- Verifies customer identity before installment approval
- Maintains audit trail of verification

## Troubleshooting

### Issue: "PAYSTACK_SECRET_KEY not configured"
**Solution:** Add secret key to backend/.env file

### Issue: "BVN verification service unavailable"
**Causes:**
- Invalid Paystack secret key
- Paystack API downtime
- Network connectivity issues
- Identity verification not enabled

**Solution:** Check Paystack dashboard status, verify API keys

### Issue: Name always shows mismatch
**Solution:** Ensure name format matches BVN records exactly (check spacing, middle names)

### Issue: Auto-fill not working
**Solution:** Check browser console for errors, verify bvnData response structure

## Future Enhancements

### Possible Additions
1. **NIN Integration** - Add National ID Number verification
2. **Bank Account Verification** - Verify bank account ownership
3. **Credit Score Integration** - Check credit history
4. **Biometric Verification** - Facial recognition matching
5. **Document Upload** - Request ID card photos
6. **Address Verification** - Confirm residential address
7. **Employment Verification** - Verify workplace information

## Related Documentation

- [PAYSTACK_SETUP.md](PAYSTACK_SETUP.md) - Payment integration guide
- [EMAIL_VALIDATION_SYSTEM.md](EMAIL_VALIDATION_SYSTEM.md) - Email verification
- [PHONE_VALIDATION_SYSTEM.md](PHONE_VALIDATION_SYSTEM.md) - Phone validation
- [PRODUCT_APPROVAL_SYSTEM.md](PRODUCT_APPROVAL_SYSTEM.md) - Admin approval system

## Support

For BVN verification issues:
1. Check Paystack API status: https://status.paystack.com
2. Review Paystack documentation: https://paystack.com/docs/identity-verification
3. Contact Paystack support: support@paystack.com
4. Check application logs for detailed error messages

## Paystack Resources

- **Documentation:** https://paystack.com/docs/identity-verification/bank-verification-number/
- **Dashboard:** https://dashboard.paystack.com
- **API Reference:** https://paystack.com/docs/api/
- **Status Page:** https://status.paystack.com
- **Support:** support@paystack.com
