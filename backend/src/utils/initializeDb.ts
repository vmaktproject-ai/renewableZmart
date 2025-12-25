import { AppDataSource } from '../config/database';
import bcrypt from 'bcrypt';

export async function initializeDatabase() {
  try {
    console.log('🌱 Checking if database needs seeding...');
    
    // Check if we have any stores
    const storeCountResult = await AppDataSource.query('SELECT COUNT(*) as count FROM stores');
    const count = parseInt(storeCountResult[0].count);
    
    if (count > 0) {
      console.log(`✅ Database already initialized with ${count} stores`);
      return;
    }

    console.log('📝 Database is empty. Starting data seeding...');

    // Step 1: Create or get vendor user
    let vendorId: string | null = null;
    
    try {
      // First try to get existing vendor
      const existingVendor = await AppDataSource.query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        ['vendor@test.com']
      );
      
      if (existingVendor && existingVendor.length > 0) {
        vendorId = existingVendor[0].id;
        console.log('✅ Using existing vendor user:', vendorId);
      }
    } catch (e) {
      console.log('⚠️  Could not find existing vendor, will create new one');
    }

    // If vendor doesn't exist, create one
    if (!vendorId) {
      try {
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
          'Renewable Energy Store',
          'vendor',
          'Nigeria',
          'Lagos'
        ]);

        if (vendorResult && vendorResult.length > 0) {
          vendorId = vendorResult[0].id;
          console.log('✅ Created new vendor user:', vendorId);
        }
      } catch (error: any) {
        console.error('❌ Error creating vendor:', error.message);
        throw error;
      }
    }

    if (!vendorId) {
      throw new Error('Failed to get or create vendor user');
    }

    // Step 2: Create stores
    console.log('🏪 Creating stores...');
    const storeNames = [
      'Solar Tech Store',
      'Green Energy Hub',
      'Renewable Power Solutions'
    ];

    const storeIds: string[] = [];

    for (const storeName of storeNames) {
      try {
        const slug = storeName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        
        const storeResult = await AppDataSource.query(`
          INSERT INTO stores (name, description, "ownerId", slug, country, city, "isActive", "isVerified", "verificationStatus", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, true, true, 'approved', NOW(), NOW())
          RETURNING id
        `, [
          storeName,
          `Premium renewable energy products from ${storeName}`,
          vendorId,
          slug,
          'Nigeria',
          'Lagos'
        ]);

        if (storeResult && storeResult.length > 0) {
          storeIds.push(storeResult[0].id);
          console.log(`  ✅ ${storeName}`);
        }
      } catch (error: any) {
        console.error(`  ❌ Failed to create ${storeName}:`, error.message);
      }
    }

    if (storeIds.length === 0) {
      throw new Error('Failed to create any stores');
    }

    console.log(`✅ Created ${storeIds.length} stores`);

    // Step 3: Create sample products for each store
    console.log('📦 Creating sample products...');

    const products = [
      {
        name: '500W Solar Panel Kit',
        description: 'High-efficiency 500W solar panel with mounting bracket',
        price: 450000,
        category: 'Solar Panels',
        stock: 25
      },
      {
        name: '5KW Inverter System',
        description: 'Pure sine wave 5KW inverter for power backup',
        price: 650000,
        category: 'Inverters',
        stock: 15
      },
      {
        name: '200Ah Lithium Battery',
        description: 'LiFePO4 200Ah battery for energy storage',
        price: 850000,
        category: 'Batteries',
        stock: 10
      },
      {
        name: 'Solar Water Pump',
        description: 'Efficient 1HP solar water pump',
        price: 280000,
        category: 'Water Systems',
        stock: 20
      },
      {
        name: '2KW Wind Turbine',
        description: 'Compact 2KW wind turbine for residential use',
        price: 920000,
        category: 'Wind Energy',
        stock: 8
      }
    ];

    let totalProducts = 0;

    for (const storeId of storeIds) {
      for (const product of products) {
        try {
          await AppDataSource.query(`
            INSERT INTO products (name, description, price, category, stock, "storeId", country, city, "approvalStatus", "isActive", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, 'Nigeria', 'Lagos', 'approved', true, NOW(), NOW())
          `, [
            product.name,
            product.description,
            product.price,
            product.category,
            product.stock,
            storeId
          ]);
          totalProducts++;
        } catch (error: any) {
          console.error(`  ⚠️  Failed to create product ${product.name}:`, error.message);
        }
      }
    }

    console.log(`✅ Created ${totalProducts} products`);
    console.log('\n✨ Database seeding complete!');
    console.log(`   📊 Stores: ${storeIds.length}`);
    console.log(`   📦 Products: ${totalProducts}`);
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Stack:', error.stack);
    // Don't throw - let the server continue even if seeding fails
  }
}
