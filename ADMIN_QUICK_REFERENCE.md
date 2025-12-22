# Admin System Quick Reference

## 🔑 Login Credentials

| Level | Email | Password | Color |
|-------|-------|----------|-------|
| SA00 - Super Admin | SA00@renewablezmart.com | 000000 | 🔴 Red |
| SA10 - Assistant Admin | SA10@renewablezmart.com | 000000 | 🟠 Orange |
| SA20 - Normal Admin | SA20@renewablezmart.com | 000000 | 🟡 Yellow |

## 📊 Permission Matrix

| Permission | SA00 | SA10 | SA20 |
|------------|------|------|------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Statistics | ✅ | ✅ | ✅ |
| View Users/Orders/Products | ✅ | ✅ | ✅ |
| Approve Product Display | ✅ | ✅ | ✅ |
| **Change Passwords** | ✅ | ❌ | ❌ |
| **Approve Financial Transactions** | ✅ | ❌ | ❌ |
| **Approve PaySmallSmall** | ✅ | ❌ | ❌ |

## 🚀 Quick Start

### 1. Create Admin Accounts
```powershell
cd backend
npm run create-admin
```

### 2. Login
- Go to http://localhost:3000/login
- Use one of the admin credentials above
- Access dashboard from profile menu or navigation bar

### 3. Access Features
- **Dashboard:** http://localhost:3000/admin-dashboard
- **Profile:** http://localhost:3000/admin-profile

## 🔒 SA00 Exclusive Features

### Change Password (SA00 Only)
1. Go to Admin Profile page
2. Select user from dropdown
3. Enter new password (min 6 characters)
4. Confirm password
5. Click "Change Password"

### Approve Financial Transaction (SA00 Only)
- Endpoint: `POST /api/admin/approve-financial/:transactionId`
- Body: `{ "approved": true/false, "amount": number }`

### Approve PaySmallSmall (SA00 Only)
- Endpoint: `POST /api/admin/approve-paysmallsmall/:orderId`
- Body: `{ "approved": true/false }`

## 📝 Common Tasks

### Approve Product Display (All Admins)
- Endpoint: `POST /api/admin/approve-product/:productId`
- Body: `{ "approved": true/false }`

### Update Order Status (All Admins)
1. Go to Admin Dashboard
2. Click "Orders" tab
3. Select new status from dropdown
4. Status updates automatically

### Delete User (All Admins)
1. Go to Admin Dashboard
2. Click "Users" tab
3. Click "Delete" button
4. Confirm deletion
5. **Note:** Cannot delete admin users

## ⚠️ Important Notes

1. **Password Changes:** Only SA00 can change passwords
2. **Financial Authority:** Only SA00 can approve financial transactions
3. **PaySmallSmall:** Only SA00 can approve payment plans
4. **Security:** All admin accounts use same password (000000) initially
5. **First Login:** SA00 should change all passwords after setup
6. **Product Approval:** All admins can approve vendor product displays

## 🔗 API Endpoints

### General (All Admins)
- `GET /api/admin/me` - Get current admin info
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products
- `GET /api/admin/stores` - Get all stores
- `GET /api/admin/stats` - Get statistics
- `POST /api/admin/approve-product/:productId` - Approve product

### SA00 Only
- `POST /api/admin/change-password/:userId` - Change password
- `POST /api/admin/approve-financial/:transactionId` - Approve financial
- `POST /api/admin/approve-paysmallsmall/:orderId` - Approve PaySmallSmall

## 🎨 Visual Indicators

- 🔴 **Red Badge** = SA00 Super Admin
- 🟠 **Orange Badge** = SA10 Assistant Admin
- 🟡 **Yellow Badge** = SA20 Normal Admin
- 🔒 **Lock Icon** = SA00-only feature
- ✅ **Green Check** = Permitted action
- ❌ **Red X** = Denied action
