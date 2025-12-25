require('reflect-metadata');
const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'mthrx1z3',
  database: 'ecommerce_db',
  synchronize: false,
});

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

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

    // Create test store
    const storeResult = await AppDataSource.query(`
      INSERT INTO stores (name, description, "ownerId", slug, country, city, "isActive", "isVerified", "verificationStatus", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, true, true, 'approved', NOW(), NOW())
      RETURNING id
    `, [
      'Solar Tech Store',
      'Premium renewable energy products and solutions',
      vendorId,
      'solar-tech-store-' + Date.now(),
      'Nigeria',
      'Lagos'
    ]);

    const storeId = storeResult[0].id;
    console.log('✅ Created test store:', storeId);

    // Create test products
    const products = [
      {
        name: '500W Solar Panel Kit',
        description: 'High-efficiency 500W solar panel with mounting bracket and cables',
        price: 450000,
        category: 'Solar Panels',
        stock: 25,
        country: 'Nigeria',
        city: 'Lagos'
      },
      {
        name: '5KW Inverter System',
        description: 'Pure sine wave 5KW inverter for reliable power backup',
        price: 650000,
        category: 'Inverters',
        stock: 15,
        country: 'Nigeria',
        city: 'Lagos'
      },
      {
        name: '200Ah Lithium Battery',
        description: 'LiFePO4 200Ah battery for long-lasting energy storage',
        price: 850000,
        category: 'Batteries',
        stock: 10,
        country: 'Nigeria',
        city: 'Lagos'
      },
      {
        name: 'Solar Water Pump',
        description: 'Efficient 1HP solar water pump for agricultural use',
        price: 280000,
        category: 'Water Systems',
        stock: 20,
        country: 'Nigeria',
        city: 'Lagos'
      },
      {
        name: 'Wind Turbine 2KW',
        description: 'Compact 2KW wind turbine for residential use',
        price: 920000,
        category: 'Wind Energy',
        stock: 5,
        country: 'Nigeria',
        city: 'Lagos'
      }
    ];

    for (const product of products) {
      await AppDataSource.query(`
        INSERT INTO products (name, description, price, category, stock, "storeId", country, city, "approvalStatus", image, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'approved', $9, NOW(), NOW())
      `, [
        product.name,
        product.description,
        product.price,
        product.category,
        product.stock,
        storeId,
        product.country,
        product.city,
        '/images/product-placeholder.jpg'
      ]);
      console.log('✅ Created product:', product.name);
    }

    await AppDataSource.destroy();
    console.log('\n✅ Test data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
