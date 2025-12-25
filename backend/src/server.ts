import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { AppDataSource } from './config/database';
import { validateEnvironment } from './config/validateEnv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import storeRoutes from './routes/stores';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import installerRoutes from './routes/installers';
import adminRoutes from './routes/admin';
import installmentRoutes from './routes/installments';
import { emailService } from './services/emailService';
import { initializeDatabase } from './utils/initializeDb';
import { forceInsertProducts } from './utils/forceInsertProducts';

// Load environment variables
config();

// Validate environment variables on startup
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 4000;

// Helmet security middleware - comprehensive security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:4000", "http://127.0.0.1:4000", "blob:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:4000", "http://127.0.0.1:4000", "https://renewable-zmart-3aam.vercel.app", "https://renewablezmart.com"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://renewable-zmart-3aam.vercel.app',
    'https://renewablezmart.com'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import rate limiters
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimiter';

// Serve uploaded files - set before rate limiting
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Embedder-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    // Set proper content type for images and videos
    if (filePath.endsWith('.jpeg') || filePath.endsWith('.jpg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    }
  }
}));

// Handle CORS preflight requests for uploads
app.options('/uploads/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.sendStatus(200);
});

// Apply rate limiting
app.use('/api/auth', authRateLimiter); // Stricter limit for auth
app.use('/api', apiRateLimiter); // General API rate limiting

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/installers', installerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/installments', installmentRoutes);

// Simple SendGrid test endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const to = (req.query.to as string) || process.env.ADMIN_EMAIL || 'vmaktproject@gmail.com';
    await emailService.sendWelcomeEmail(to, 'Test', 'customer');
    res.json({ ok: true, to });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'Failed to send test email' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Express backend is running' });
});

// Manual seed endpoint (for emergency database population)
app.post('/api/seed-database', async (req, res) => {
  try {
    console.log('🌱 Manual seed endpoint called');
    await initializeDatabase();
    res.json({ ok: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Force insert products endpoint
app.post('/api/force-insert-products', async (req, res) => {
  try {
    console.log('💪 Force insert products endpoint called');
    const result = await forceInsertProducts();
    if (result.ok) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Clean up seed data endpoint
app.post('/api/cleanup-seed-data', async (req, res) => {
  try {
    console.log('🧹 Cleanup seed data endpoint called');
    
    if (!AppDataSource.isInitialized) {
      throw new Error('Database not initialized');
    }

    const seedProductNames = [
      '500W Solar Panel Kit',
      '5KW Inverter System',
      '200Ah Lithium Battery',
      'Solar Water Pump',
      '2KW Wind Turbine',
      'Hybrid Solar Inverter 3KW',
      '150W Solar Light Kit',
      'Wind Charge Controller'
    ];

    // Delete seed products
    const deleteProductsResult = await AppDataSource.query(
      `DELETE FROM products WHERE name = ANY($1)`,
      [seedProductNames]
    );
    console.log(`✅ Deleted ${deleteProductsResult.rowCount} seed products`);

    // Find orphaned stores (stores with no products)
    const orphanedStores = await AppDataSource.query(
      `SELECT stores.id FROM stores 
       LEFT JOIN products ON stores.id = products."storeId" 
       WHERE products."storeId" IS NULL 
       GROUP BY stores.id`
    );

    // Delete orphaned stores
    let deletedStores = 0;
    if (orphanedStores && orphanedStores.length > 0) {
      const orphanIds = orphanedStores.map((s: any) => s.id);
      const deleteStoresResult = await AppDataSource.query(
        'DELETE FROM stores WHERE id = ANY($1)',
        [orphanIds]
      );
      deletedStores = deleteStoresResult.rowCount || 0;
      console.log(`✅ Deleted ${deletedStores} orphaned stores`);
    }

    // Delete test vendor
    let deletedVendor = 0;
    try {
      const deleteVendorResult = await AppDataSource.query(
        `DELETE FROM users WHERE email = 'vendor@test.com'`
      );
      deletedVendor = deleteVendorResult.rowCount || 0;
      if (deletedVendor > 0) {
        console.log('✅ Deleted test vendor account');
      }
    } catch (e) {
      console.log('⚠️  Could not delete test vendor (may not exist)');
    }

    // Verify cleanup
    const storesCount = await AppDataSource.query('SELECT COUNT(*) as count FROM stores');
    const productsCount = await AppDataSource.query('SELECT COUNT(*) as count FROM products');
    const usersCount = await AppDataSource.query('SELECT COUNT(*) as count FROM users');

    res.json({
      ok: true,
      message: 'Seed data cleaned up successfully',
      removed: {
        products: deleteProductsResult.rowCount || 0,
        stores: deletedStores,
        vendors: deletedVendor
      },
      remaining: {
        stores: parseInt(storesCount[0].count),
        products: parseInt(productsCount[0].count),
        users: parseInt(usersCount[0].count)
      }
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Database status endpoint
app.get('/api/database-status', async (req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      return res.json({ ok: false, message: 'Database not initialized' });
    }

    const storesCount = await AppDataSource.query('SELECT COUNT(*) as count FROM stores');
    const productsCount = await AppDataSource.query('SELECT COUNT(*) as count FROM products');
    const usersCount = await AppDataSource.query('SELECT COUNT(*) as count FROM users');
    const ordersCount = await AppDataSource.query('SELECT COUNT(*) as count FROM orders');

    res.json({
      ok: true,
      database: 'connected',
      data: {
        stores: parseInt(storesCount[0].count),
        products: parseInt(productsCount[0].count),
        users: parseInt(usersCount[0].count),
        orders: parseInt(ordersCount[0].count)
      }
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Initialize database and start server
AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Database connected successfully');
    console.log('📊 TypeORM initialized');

    // Initialize database with seed data if empty
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Express server running on http://localhost:${PORT}`);
      console.log(`📚 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error('❌ Server error: Port already in use. Please stop other instances first.');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit on unhandled rejections - just log them
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      // Don't crash the server for every exception
      // Only critical errors should crash
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        AppDataSource.destroy().then(() => {
          console.log('Database connections closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('👋 SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        AppDataSource.destroy().then(() => {
          console.log('Database connections closed');
          process.exit(0);
        });
      });
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

export default app;
