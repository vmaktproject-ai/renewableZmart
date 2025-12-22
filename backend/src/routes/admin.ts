import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { User, AdminLevel, UserRole } from '../models/User';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Store } from '../models/Store';
import { authenticate } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = Router();

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && (req.user.role === 'admin' || req.user.accountType === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Middleware to check if user is SA00 (Super Admin)
const isSuperAdmin = async (req: any, res: any, next: any) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.userId } });
    
    if (user && user.adminLevel === AdminLevel.SA00) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Super Admin (SA00) only.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin level' });
  }
};

// Get all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'country', 'city', 'role', 'accountType', 'createdAt']
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await userRepo.remove(user);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get all orders
router.get('/orders', authenticate, isAdmin, async (req, res) => {
  try {
    const orderRepo = AppDataSource.getRepository(Order);
    const orders = await orderRepo.find({
      order: { createdAt: 'DESC' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Update order status
router.patch('/orders/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderRepo = AppDataSource.getRepository(Order);
    
    const order = await orderRepo.findOne({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await orderRepo.save(order);

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// Get all products
router.get('/products', authenticate, isAdmin, async (req, res) => {
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const products = await productRepo.find({
      relations: ['store']
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get pending products for approval
router.get('/products/pending', authenticate, isAdmin, async (req, res) => {
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const pendingProducts = await productRepo.find({
      where: { approvalStatus: 'pending' },
      relations: ['store'],
      order: { createdAt: 'DESC' }
    });

    res.json(pendingProducts);
  } catch (error) {
    console.error('Error fetching pending products:', error);
    res.status(500).json({ message: 'Failed to fetch pending products' });
  }
});

// Delete product
router.delete('/products/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ where: { id: req.params.id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await productRepo.remove(product);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Get all stores
router.get('/stores', authenticate, isAdmin, async (req, res) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);
    const stores = await storeRepo.find();

    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
});

// Delete store
router.delete('/stores/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);
    const store = await storeRepo.findOne({ where: { id: req.params.id } });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await storeRepo.remove(store);
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ message: 'Failed to delete store' });
  }
});

// Get platform statistics (admin only)
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const orderRepo = AppDataSource.getRepository(Order);
    const productRepo = AppDataSource.getRepository(Product);
    const storeRepo = AppDataSource.getRepository(Store);

    const [totalUsers, totalOrders, totalProducts, totalStores] = await Promise.all([
      userRepo.count(),
      orderRepo.count(),
      productRepo.count(),
      storeRepo.count()
    ]);

    const orders = await orderRepo.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const users = await userRepo.find();
    const totalVendors = users.filter(u => u.role === 'vendor').length;
    const totalInstallers = users.filter(u => u.role === 'installer').length;
    const totalCustomers = users.filter(u => u.role === 'customer').length;

    res.json({
      totalUsers,
      totalVendors,
      totalInstallers,
      totalCustomers,
      totalOrders,
      totalRevenue,
      totalProducts,
      totalStores
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Public stats endpoint (no authentication required)
router.get('/stats/public', async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const productRepo = AppDataSource.getRepository(Product);
    const storeRepo = AppDataSource.getRepository(Store);

    const [approvedProducts, totalVendors, totalInstallers, totalCustomers, totalStores] = await Promise.all([
      productRepo.count({ where: { approvalStatus: 'approved' } }),
      userRepo.count({ where: { role: 'vendor' } }),
      userRepo.count({ where: { accountType: 'installer' } }),
      userRepo.count({ where: { role: 'customer' } }),
      storeRepo.count()
    ]);

    res.json({
      products: approvedProducts,
      vendors: totalVendors,
      installers: totalInstallers,
      customers: totalCustomers,
      stores: totalStores
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// SA00 ONLY: Change admin password
router.post('/change-password/:userId', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { userId } = req.params;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await userRepo.save(user);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// SA00 ONLY: Approve PaySmallSmall request
router.post('/approve-paysmallsmall/:orderId', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approved } = req.body;

    const orderRepo = AppDataSource.getRepository(Order);
    const order = await orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add paySmallSmallApproved field logic here
    res.json({ 
      message: approved ? 'PaySmallSmall approved' : 'PaySmallSmall rejected',
      orderId 
    });
  } catch (error) {
    console.error('Error approving PaySmallSmall:', error);
    res.status(500).json({ message: 'Failed to approve PaySmallSmall' });
  }
});

// SA00 ONLY: Approve financial transaction
router.post('/approve-financial/:transactionId', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { approved, amount } = req.body;

    res.json({ 
      message: approved ? 'Financial transaction approved' : 'Financial transaction rejected',
      transactionId,
      amount 
    });
  } catch (error) {
    console.error('Error approving financial transaction:', error);
    res.status(500).json({ message: 'Failed to approve financial transaction' });
  }
});

// SA10/SA20: Approve product for display
router.post('/approve-product/:productId', authenticate, isAdmin, async (req: any, res) => {
  try {
    const { productId } = req.params;
    const { approved } = req.body;

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get admin info
    const userRepo = AppDataSource.getRepository(User);
    const admin = await userRepo.findOne({ where: { id: req.user.userId } });

    // Update product approval status
    product.approvalStatus = approved ? 'approved' : 'rejected';
    product.approvedBy = admin?.id || '';
    product.approvedAt = new Date();
    await productRepo.save(product);

    res.json({ 
      message: approved ? 'Product approved for display' : 'Product rejected',
      productId,
      approvalStatus: product.approvalStatus
    });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ message: 'Failed to approve product' });
  }
});

// Get current admin info including level
router.get('/me', authenticate, isAdmin, async (req: any, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ 
      where: { id: req.user.userId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'adminLevel']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching admin info:', error);
    res.status(500).json({ message: 'Failed to fetch admin info' });
  }
});

// ===== VENDOR VERIFICATION ROUTES =====

// Get all vendors pending verification
router.get('/vendors/pending', authenticate, isAdmin, async (req: any, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const vendors = await userRepo.find({
      where: { 
        role: UserRole.VENDOR,
        verificationStatus: 'pending'
      },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'country', 'city', 'businessName', 'businessRegNumber', 'createdAt', 'verificationStatus']
    });

    res.json(vendors);
  } catch (error) {
    console.error('Error fetching pending vendors:', error);
    res.status(500).json({ message: 'Failed to fetch pending vendors' });
  }
});

// Get all vendors (all statuses)
router.get('/vendors', authenticate, isAdmin, async (req: any, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const vendors = await userRepo.find({
      where: { role: UserRole.VENDOR },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'country', 'city', 'businessName', 'businessRegNumber', 'isVerified', 'verificationStatus', 'verifiedAt', 'createdAt']
    });

    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
});

// Verify/Approve vendor
router.post('/vendors/:id/verify', authenticate, isAdmin, async (req: any, res) => {
  try {
    const { status, notes } = req.body; // status: 'approved' or 'rejected'
    const userRepo = AppDataSource.getRepository(User);
    const storeRepo = AppDataSource.getRepository(Store);
    
    const vendor = await userRepo.findOne({ where: { id: req.params.id, role: UserRole.VENDOR } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.verificationStatus = status;
    vendor.isVerified = status === 'approved';
    vendor.verifiedBy = req.user.userId;
    vendor.verifiedAt = new Date();
    vendor.verificationNotes = notes || '';

    await userRepo.save(vendor);

    // Also update the vendor's stores
    if (status === 'approved') {
      await storeRepo.update(
        { ownerId: vendor.id },
        {
          verificationStatus: 'approved',
          isVerified: true,
          verifiedBy: req.user.userId,
          verifiedAt: new Date()
        }
      );
    }

    res.json({ message: `Vendor ${status} successfully`, vendor });
  } catch (error) {
    console.error('Error verifying vendor:', error);
    res.status(500).json({ message: 'Failed to verify vendor' });
  }
});

// ===== ADMIN PRODUCT POSTING ROUTES =====

// Admin creates product and posts to multiple countries
router.post('/products/create', authenticate, isAdmin, async (req: any, res) => {
  try {
    const { name, description, price, image, category, stock, storeId, countries, city } = req.body;
    
    const productRepo = AppDataSource.getRepository(Product);
    const storeRepo = AppDataSource.getRepository(Store);

    // Verify store exists
    const store = await storeRepo.findOne({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Create product
    const product = productRepo.create({
      name,
      description,
      price,
      image,
      category,
      stock,
      storeId,
      country: store.country, // Main country from store
      city: city || store.city,
      availableCountries: countries || [store.country], // Array of countries
      postedByAdmin: true,
      adminPosterId: req.user.userId,
      approvalStatus: 'approved', // Admin-posted products are auto-approved
      approvedBy: req.user.userId,
      approvedAt: new Date()
    });

    const savedProduct = await productRepo.save(product);
    res.status(201).json({ message: 'Product created successfully', product: savedProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Get all verified stores for admin product posting
router.get('/stores/verified', authenticate, isAdmin, async (req, res) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);
    const stores = await storeRepo.find({
      where: { 
        isVerified: true,
        isActive: true 
      },
      select: ['id', 'name', 'slug', 'country', 'city', 'ownerId']
    });

    res.json(stores);
  } catch (error) {
    console.error('Error fetching verified stores:', error);
    res.status(500).json({ message: 'Failed to fetch verified stores' });
  }
});

// Link product to a different store
router.patch('/products/:id/link-store', authenticate, isAdmin, async (req, res) => {
  try {
    const { storeId } = req.body;
    const productRepo = AppDataSource.getRepository(Product);
    const storeRepo = AppDataSource.getRepository(Store);

    const product = await productRepo.findOne({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const store = await storeRepo.findOne({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    product.storeId = storeId;
    await productRepo.save(product);

    res.json({ message: 'Product linked to store successfully', product });
  } catch (error) {
    console.error('Error linking product to store:', error);
    res.status(500).json({ message: 'Failed to link product to store' });
  }
});

// Update product available countries
router.patch('/products/:id/countries', authenticate, isAdmin, async (req, res) => {
  try {
    const { countries } = req.body; // Array of country names
    const productRepo = AppDataSource.getRepository(Product);

    const product = await productRepo.findOne({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.availableCountries = countries;
    await productRepo.save(product);

    res.json({ message: 'Product countries updated successfully', product });
  } catch (error) {
    console.error('Error updating product countries:', error);
    res.status(500).json({ message: 'Failed to update product countries' });
  }
});

export default router;
