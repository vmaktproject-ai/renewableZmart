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
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://127.0.0.1:3000"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import rate limiters
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimiter';

// Serve uploaded files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully');
    console.log('📊 TypeORM initialized');

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
