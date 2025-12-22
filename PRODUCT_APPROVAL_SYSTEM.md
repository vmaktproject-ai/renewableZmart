# Product Approval System

## Overview
The Product Approval System ensures quality control by requiring admin approval before vendor products appear in the marketplace.

## How It Works

### 1. **Vendor Product Submission**
- Vendors can ONLY add products to stores they own
- When a vendor adds a product, it's automatically set to `pending` status
- Product includes country and city from the vendor's store
- Pending products are NOT visible in the public marketplace

### 2. **Admin Review Process**
All admins (SA00, SA10, SA20) can review and approve products:
- Products appear in the admin approval queue
- Admins can filter by country to review products for specific marketplaces
- Each product shows full details including location, price, stock, and store

### 3. **Approval/Rejection**
- **Approve**: Product becomes visible in the marketplace for that country
- **Reject**: Product is not displayed and marked as rejected
- Approval history is tracked (who approved and when)

## Access Product Approval

### For Admins
1. Login as any admin (SA00, SA10, or SA20)
2. Go to Admin Dashboard
3. Click on the yellow "Pending Products" alert (if any pending)
4. Or navigate to: http://localhost:3000/admin-product-approval

## Features

### Product Approval Page
- **Filter by Country**: View products by specific country
- **Product Details**: See all product information before approving
- **One-Click Approval**: Approve or reject with single click
- **Real-time Updates**: Products removed from queue immediately after action
- **Summary Statistics**: Track pending count by country

### Dashboard Integration
- **Pending Count**: Shows number of products awaiting approval
- **Alert Banner**: Prominent notification when products are pending
- **Direct Link**: Click banner to go straight to approval page

## Vendor Restrictions

### Store Ownership Verification
- Vendors can ONLY post products to stores they own
- System verifies store ownership before allowing product creation
- Attempting to post to another vendor's store returns error

### Automatic Location Assignment
- Product country and city are automatically set from the store
- Vendors cannot manually change product location
- Ensures products appear in correct marketplace

## Product Visibility Rules

### Public Marketplace
- Only `approved` products are visible
- Products filtered by country when user selects location
- Pending and rejected products never appear

### Vendor Dashboard
- Vendors see ALL their products regardless of status
- Status badges show: Pending (yellow), Approved (green), Rejected (red)
- Vendors can edit pending/rejected products

## API Endpoints

### For Admins
```
GET /api/admin/products/pending
- Get all products with status 'pending'
- Includes store information
- Ordered by creation date (newest first)

POST /api/admin/approve-product/:productId
- Approve or reject a product
- Body: { "approved": true/false }
- Returns updated approval status
```

### For Vendors
```
POST /api/products
- Create new product (auto-set to pending)
- Requires valid storeId owned by vendor
- Auto-assigns country/city from store
- Returns success message about pending approval
```

### For Public
```
GET /api/products
- Get all approved products
- Can filter by ?country=Nigeria
- Only returns products with approvalStatus='approved'
```

## Database Schema

### Product Model Additions
```typescript
approvalStatus: string  // 'pending', 'approved', 'rejected'
approvedBy: string     // Admin ID who approved
approvedAt: Date       // Timestamp of approval
city: string           // Product city (from store)
```

## Workflow Example

### Vendor Posts Product
1. Vendor creates product in their store
2. System verifies vendor owns the store
3. Product country/city copied from store
4. Product status set to 'pending'
5. Vendor sees "Pending Admin Approval" message

### Admin Reviews
1. Admin sees notification: "5 Products Pending Approval"
2. Admin clicks to view approval queue
3. Filters products by country: "Nigeria"
4. Reviews product details
5. Clicks "Approve" for quality products
6. Product immediately appears in Nigerian marketplace

### Customer Shops
1. Customer selects location: "Lagos, Nigeria"
2. Marketplace shows only approved products from Nigeria
3. Customer sees high-quality, verified products
4. Customer can purchase with confidence

## Benefits

### For Platform
✅ Quality control over marketplace listings
✅ Prevent spam or inappropriate products
✅ Country-specific product curation
✅ Admin accountability (tracks who approved what)

### For Vendors
✅ Clear submission process
✅ Can only post to own stores (prevents errors)
✅ Automatic location assignment (no mistakes)
✅ Visibility into approval status

### For Customers
✅ Only see approved, quality products
✅ Products are relevant to their location
✅ Trust in marketplace quality
✅ Better shopping experience

## Admin Dashboard Features

### Pending Products Alert
- Shows count of pending products
- Animated yellow badge for attention
- One-click access to approval page
- Visible to all admin levels

### Approval Queue
- Grid view of all pending products
- Product images and details
- Country filter for targeted review
- Approve/Reject buttons
- Real-time count updates

## Future Enhancements

Potential additions:
- Bulk approval/rejection
- Approval comments/notes
- Email notifications to vendors
- Approval history log
- Product edit requests
- Re-submission workflow
- Category-specific approvers
- Automated quality checks
