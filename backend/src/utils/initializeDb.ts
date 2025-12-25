import { AppDataSource } from '../config/database';
import bcrypt from 'bcrypt';

export async function initializeDatabase() {
  try {
    // Check if we have any stores
    const storeRepository = AppDataSource.getRepository('Store');
    const storeCount = await AppDataSource.query('SELECT COUNT(*) as count FROM stores');
    
    if (storeCount[0].count > 0) {
      console.log(`✅ Database already initialized with ${storeCount[0].count} stores`);
      return;
    }

    console.log('🌱 Initializing database with seed data...');

    // Create a vendor user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const vendorResult = await AppDataSource.query(`
      INSERT INTO users (email, password, "firstName", "lastName", "businessName", role, country, city, "isVerified", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET "updatedAt" = NOW()
      RETURNING id
    `, [
      'vendor@test.com',
      hashedPassword,
      'Test',
      'Vendor',
      'Test Store',
      'vendor',
      'Nigeria',
      'Lagos'
    ]);

    const vendorId = vendorResult[0]?.id;

    if (!vendorId) {
      // Try to get existing vendor
      const existingVendor = await AppDataSource.query(
        'SELECT id FROM users WHERE email = $1',
        ['vendor@test.com']
      );
      
      if (!existingVendor[0]) {
        throw new Error('Failed to create vendor');
      }
      
      console.log('✅ Using existing vendor');
    } else {
      console.log('✅ Created test vendor:', vendorId);
    }

    // Create stores
    const stores = [
      {
        name: 'Solar Tech Store',
        slug: 'solar-tech-store-1',
        description: 'Premium renewable energy products and solutions for residential and commercial use'
      },
      {
        name: 'Green Energy Hub',
        slug: 'green-energy-hub-1',
        description: 'Leading provider of eco-friendly energy solutions and sustainable products'
      },
      {
        name: 'Renewable Power Solutions',
        slug: 'renewable-power-solutions-1',
        description: 'Complete renewable energy systems and installation services'
      }
    ];

    for (const store of stores) {
      await AppDataSource.query(`
        INSERT INTO stores (name, description, "ownerId", slug, country, city, "isActive", "isVerified", "verificationStatus", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, true, true, 'approved', NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET "updatedAt" = NOW()
      `, [
        store.name,
        store.description,
        vendorId,
        store.slug,
        'Nigeria',
        'Lagos'
      ]);
    }

    console.log('✅ Created seed stores');

    // Create sample products
    const storeResult = await AppDataSource.query('SELECT id FROM stores LIMIT 1');
    const storeId = storeResult[0]?.id;

    if (storeId) {
      const products = [
        {
          name: '500W Solar Panel Kit',
          description: 'High-efficiency 500W solar panel with mounting bracket and cables',
          price: 450000,
          category: 'Solar Panels',
          stock: 25
        },
        {
          name: '5KW Inverter System',
          description: 'Pure sine wave 5KW inverter for reliable power backup',
          price: 650000,
          category: 'Inverters',
          stock: 15
        },
        {
          name: '200Ah Lithium Battery',
          description: 'LiFePO4 200Ah battery for long-lasting energy storage',
          price: 850000,
          category: 'Batteries',
          stock: 10
        }
      ];

      for (const product of products) {
        await AppDataSource.query(`
          INSERT INTO products (name, description, price, category, stock, "storeId", country, city, "approvalStatus", "isActive", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, 'Nigeria', 'Lagos', 'approved', true, NOW(), NOW())
          ON CONFLICT DO NOTHING
        `, [
          product.name,
          product.description,
          product.price,
          product.category,
          product.stock,
          storeId
        ]);
      }

      console.log('✅ Created seed products');
    }

    console.log('✨ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    // Don't exit - let the server continue even if seeding fails
  }
}
