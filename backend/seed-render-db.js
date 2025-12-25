require('reflect-metadata');
const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// Use DATABASE_URL from Render environment, fall back to local for testing
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:mthrx1z3@127.0.0.1:5432/ecommerce_db';

console.log('🔌 Connecting to database...');
console.log('📍 Database URL (masked):', databaseUrl.replace(/:[^@]*@/, ':***@'));

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  synchronize: false,
  ssl: {
    rejectUnauthorized: false, // Required for Render's PostgreSQL
  }
});

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    // Check if stores already exist
    const existingStores = await AppDataSource.query('SELECT COUNT(*) as count FROM stores');
    console.log(`📊 Existing stores: ${existingStores[0].count}`);
    
    if (existingStores[0].count > 0) {
      console.log('⚠️  Database already has stores. Exiting to avoid duplicates.');
      await AppDataSource.destroy();
      return;
    }

    // Create test vendor user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const vendorResult = await AppDataSource.query(`
      INSERT INTO users (email, password, "firstName", "lastName", "businessName", role, country, city, "isVerified", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
      RETURNING id
    `, [
      'vendor@test.com',
      hashedPassword,
      'Test',
      'Vendor',
      'Solar Tech Store',
      'vendor',
      'Nigeria',
      'Lagos'
    ]);

    const vendorId = vendorResult[0].id;
    console.log('✅ Created test vendor:', vendorId);

    // Create test stores - 3 different stores
    const storesData = [
      {
        name: 'Solar Tech Store',
        slug: 'solar-tech-store-1',
        description: 'Premium renewable energy products and solutions for residential and commercial use',
        country: 'Nigeria',
        city: 'Lagos'
      },
      {
        name: 'Green Energy Hub',
        slug: 'green-energy-hub-1',
        description: 'Leading provider of eco-friendly energy solutions and sustainable products',
        country: 'Nigeria',
        city: 'Abuja'
      },
      {
        name: 'Renewable Power Solutions',
        slug: 'renewable-power-solutions-1',
        description: 'Complete renewable energy systems and installation services',
        country: 'Nigeria',
        city: 'Kano'
      }
    ];

    const storeIds = [];

    for (const storeData of storesData) {
      const storeResult = await AppDataSource.query(`
        INSERT INTO stores (name, description, "ownerId", slug, country, city, "isActive", "isVerified", "verificationStatus", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, true, true, 'approved', NOW(), NOW())
        RETURNING id
      `, [
        storeData.name,
        storeData.description,
        vendorId,
        storeData.slug,
        storeData.country,
        storeData.city
      ]);

      const storeId = storeResult[0].id;
      storeIds.push(storeId);
      console.log(`✅ Created store: ${storeData.name} (${storeId})`);
    }

    // Create diverse test products for each store
    const productsPerStore = [
      {
        name: '500W Solar Panel Kit',
        description: 'High-efficiency 500W solar panel with mounting bracket and cables. Perfect for residential installations.',
        price: 450000,
        category: 'Solar Panels',
        stock: 25,
        image: 'https://via.placeholder.com/400x400?text=500W+Solar+Panel'
      },
      {
        name: '5KW Inverter System',
        description: 'Pure sine wave 5KW inverter for reliable power backup and energy management',
        price: 650000,
        category: 'Inverters',
        stock: 15,
        image: 'https://via.placeholder.com/400x400?text=5KW+Inverter'
      },
      {
        name: '200Ah Lithium Battery',
        description: 'LiFePO4 200Ah battery for long-lasting energy storage and efficient power delivery',
        price: 850000,
        category: 'Batteries',
        stock: 10,
        image: 'https://via.placeholder.com/400x400?text=200Ah+Battery'
      },
      {
        name: 'Solar Water Pump System',
        description: 'Efficient 1HP solar water pump for agricultural use and water management',
        price: 280000,
        category: 'Water Systems',
        stock: 20,
        image: 'https://via.placeholder.com/400x400?text=Water+Pump'
      },
      {
        name: '2KW Wind Turbine',
        description: 'Compact 2KW wind turbine for residential use with controller and tower',
        price: 920000,
        category: 'Wind Energy',
        stock: 8,
        image: 'https://via.placeholder.com/400x400?text=Wind+Turbine'
      },
      {
        name: 'Solar Charge Controller',
        description: 'MPPT solar charge controller for maximum power point tracking',
        price: 95000,
        category: 'Controllers',
        stock: 40,
        image: 'https://via.placeholder.com/400x400?text=Charge+Controller'
      },
      {
        name: 'Installation Service - Complete Setup',
        description: 'Professional installation service including site assessment and system setup',
        price: 150000,
        category: 'Services',
        stock: 999,
        image: 'https://via.placeholder.com/400x400?text=Installation+Service'
      },
      {
        name: 'Solar Panel Mounting Bracket',
        description: 'Heavy-duty aluminum mounting bracket for secure solar panel installation',
        price: 45000,
        category: 'Accessories',
        stock: 60,
        image: 'https://via.placeholder.com/400x400?text=Mounting+Bracket'
      }
    ];

    let productCount = 0;

    for (let i = 0; i < storeIds.length; i++) {
      const storeId = storeIds[i];
      
      for (const product of productsPerStore) {
        await AppDataSource.query(`
          INSERT INTO products (name, description, price, category, stock, "storeId", country, city, "approvalStatus", "isActive", image, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, 'Nigeria', 'Lagos', 'approved', true, $7, NOW(), NOW())
        `, [
          product.name,
          product.description,
          product.price,
          product.category,
          product.stock,
          storeId,
          product.image
        ]);

        productCount++;
      }

      console.log(`✅ Created ${productsPerStore.length} products for store ${i + 1}`);
    }

    console.log(`\n✨ Database seeding complete!`);
    console.log(`📦 Total products created: ${productCount}`);
    console.log(`🏪 Total stores created: ${storeIds.length}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedData();
