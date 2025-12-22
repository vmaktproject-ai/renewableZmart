# Admin Dashboard

## Overview
The Admin Dashboard provides complete platform management capabilities for RenewableZmart with a hierarchical admin system.

## Admin Hierarchy

### 🔴 SA00 - Super Admin (Highest Authority)
- **Email:** SA00@renewablezmart.com
- **Password:** 000000
- **Permissions:**
  - ✅ Change admin passwords (all users)
  - ✅ Approve financial transactions
  - ✅ Approve PaySmallSmall requests
  - ✅ Approve product displays
  - ✅ All admin permissions

### 🟠 SA10 - Assistant Admin
- **Email:** SA10@renewablezmart.com
- **Password:** 000000
- **Permissions:**
  - ✅ Approve product displays for vendor stores
  - ✅ View platform statistics
  - ❌ Cannot change passwords
  - ❌ Cannot approve financial transactions

### 🟡 SA20 - Normal Admin
- **Email:** SA20@renewablezmart.com
- **Password:** 000000
- **Permissions:**
  - ✅ Approve product displays for vendor stores
  - ✅ View platform statistics
  - ❌ Cannot change passwords
  - ❌ Cannot approve financial transactions

## Features

### 📊 Dashboard Overview
- Real-time statistics
- Total users, orders, revenue, products, and stores
- User breakdown (vendors, installers, customers)
- Recent orders and users overview

### 👥 User Management
- View all registered users
- User details (name, email, role, location)
- Delete users (except admin users)
- Filter by user type

### 🛒 Order Management
- View all orders across the platform
- Update order status (pending → processing → shipped → delivered → cancelled)
- Monitor payment status
- Access order details

### 📦 Product Management
- View all products in the marketplace
- Product details (name, category, price, stock, location)
- Delete products if needed

### 🏪 Store Management
- View all vendor stores
- Store information (name, owner, location)
- Delete stores if needed

## Access

### Creating Admin Accounts

Run this command in the backend directory:

```powershell
cd backend
npm run create-admin
```

This will create three admin accounts:
- **SA00@renewablezmart.com** (Super Admin) - Password: 000000
- **SA10@renewablezmart.com** (Assistant Admin) - Password: 000000  
- **SA20@renewablezmart.com** (Normal Admin) - Password: 000000

**⚠️ IMPORTANT:** 
- Only SA00 can change passwords
- Change default passwords after first login
- Store credentials securely

### Accessing the Dashboard

1. Login with admin credentials at: http://localhost:3000/login
2. Once logged in, click on your profile dropdown
3. Select "⚙️ Admin Dashboard"
4. Or navigate directly to: http://localhost:3000/admin-dashboard

## Admin-Only Features

The dashboard is protected and only accessible to users with admin role. Non-admin users will be redirected to the homepage.

### API Endpoints

All admin endpoints require authentication and admin role:

#### General Admin Endpoints
- `GET /api/admin/me` - Get current admin info including level
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/products` - Get all products
- `DELETE /api/admin/products/:id` - Delete a product
- `GET /api/admin/stores` - Get all stores
- `DELETE /api/admin/stores/:id` - Delete a store
- `GET /api/admin/stats` - Get platform statistics

#### SA00 Only Endpoints
- `POST /api/admin/change-password/:userId` - Change any user's password
- `POST /api/admin/approve-paysmallsmall/:orderId` - Approve PaySmallSmall request
- `POST /api/admin/approve-financial/:transactionId` - Approve financial transaction

#### SA10/SA20 Endpoints
- `POST /api/admin/approve-product/:productId` - Approve product for display

## Security

- Admin routes are protected with JWT authentication
- Role-based access control ensures only admins can access
- Hierarchical permissions (SA00 > SA10 > SA20)
- SA00 is the only admin who can change passwords
- Financial approvals require SA00 authorization
- PaySmallSmall approvals require SA00 authorization
- Admin users cannot be deleted through the dashboard
- All sensitive actions are logged

## Pages

### Admin Dashboard (`/admin-dashboard`)
Main dashboard with statistics and management features for all admin levels

### Admin Profile (`/admin-profile`)
- View admin account information and level
- View permissions based on admin level
- **SA00 ONLY:** Change passwords for any user in the system
- Permission management and security

## Navigation

The admin dashboard links appear in:
1. User profile dropdown menu (when logged in as admin)
2. Top navigation bar (animated red button for quick access)
3. Admin Profile button in the dashboard header

## Future Enhancements

Potential additions:
- Email notifications for admin actions
- Audit logs for all admin activities
- Bulk user/product management
- Advanced analytics and reports
- Store approval workflow
- Product moderation queue
- Custom role permissions
- Export data to CSV/Excel
