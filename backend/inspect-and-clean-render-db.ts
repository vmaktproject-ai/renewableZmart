import * as pg from 'pg';

const client = new pg.Client({
  host: 'dpg-c0u4jj9f7o1s73c5c1pg-a.oregon-postgres.render.com',
  port: 5432,
  database: 'renewablezmart_ecom',
  user: 'renewablezmart_user',
  password: process.env.RENDER_DB_PASSWORD || 'your_render_password_here',
  ssl: { rejectUnauthorized: false }
});

async function inspectAndCleanDatabase() {
  try {
    console.log('🔌 Connecting to Render PostgreSQL...\n');
    await client.connect();
    console.log('✅ Connected to Render database\n');

    // 1. Check current data
    console.log('📊 CURRENT DATA STATUS');
    console.log('═'.repeat(50));

    const storesQuery = await client.query('SELECT COUNT(*) as count FROM stores');
    const storeCount = parseInt(storesQuery.rows[0].count);
    console.log(`📍 Stores: ${storeCount}`);

    const productsQuery = await client.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(productsQuery.rows[0].count);
    console.log(`📦 Products: ${productCount}`);

    const usersQuery = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(usersQuery.rows[0].count);
    console.log(`👥 Users: ${userCount}`);

    const ordersQuery = await client.query('SELECT COUNT(*) as count FROM orders');
    const orderCount = parseInt(ordersQuery.rows[0].count);
    console.log(`🛍️  Orders: ${orderCount}\n`);

    // 2. List stores
    if (storeCount > 0) {
      console.log('📍 STORES DETAILS');
      console.log('═'.repeat(50));
      const storesData = await client.query(
        'SELECT id, name, "ownerId", "isActive", "isVerified" FROM stores ORDER BY "createdAt" DESC LIMIT 10'
      );
      storesData.rows.forEach((s, idx) => {
        console.log(`${idx + 1}. ${s.name}`);
        console.log(`   ID: ${s.id}`);
        console.log(`   Owner: ${s.ownerId}`);
        console.log(`   Active: ${s.isActive}, Verified: ${s.isVerified}\n`);
      });
    }

    // 3. List products
    if (productCount > 0) {
      console.log('📦 PRODUCTS DETAILS');
      console.log('═'.repeat(50));
      const productsData = await client.query(
        'SELECT id, name, price, "storeId", "approvalStatus", "isActive" FROM products ORDER BY "createdAt" DESC LIMIT 10'
      );
      productsData.rows.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.name} - ₦${p.price}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Store: ${p.storeId}`);
        console.log(`   Status: ${p.approvalStatus}, Active: ${p.isActive}\n`);
      });
    }

    // 4. List users
    if (userCount > 0) {
      console.log('👥 USERS DETAILS');
      console.log('═'.repeat(50));
      const usersData = await client.query(
        'SELECT id, email, role, "businessName", "isVerified" FROM users ORDER BY "createdAt" DESC LIMIT 10'
      );
      usersData.rows.forEach((u, idx) => {
        console.log(`${idx + 1}. ${u.email} (${u.role})`);
        console.log(`   Business: ${u.businessName || 'N/A'}`);
        console.log(`   Verified: ${u.isVerified}\n`);
      });
    }

    // 5. Ask about cleanup
    console.log('\n⚠️  DATABASE CLEANUP OPTIONS');
    console.log('═'.repeat(50));
    console.log('1. Remove all SEED data (keep real user data)');
    console.log('2. Remove ALL data (full reset)');
    console.log('3. List seed products (products from seeding script)');
    console.log('4. Exit without changes\n');

    // Check for seed data markers
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

    const seedCheckQuery = await client.query(
      `SELECT COUNT(*) as count FROM products WHERE name = ANY($1)`,
      [seedProductNames]
    );
    const seedCount = parseInt(seedCheckQuery.rows[0].count);
    console.log(`🌱 Seed products detected: ${seedCount}\n`);

    if (seedCount > 0) {
      console.log('🧹 REMOVING SEED DATA...\n');
      
      // Delete seed products
      const deleteResult = await client.query(
        `DELETE FROM products WHERE name = ANY($1)`,
        [seedProductNames]
      );
      console.log(`✅ Deleted ${deleteResult.rowCount} seed products\n`);

      // Check if any stores have zero products now (orphaned stores)
      const orphanedStores = await client.query(
        'SELECT stores.id, stores.name FROM stores LEFT JOIN products ON stores.id = products."storeId" WHERE products."storeId" IS NULL'
      );
      
      if (orphanedStores.rowCount > 0) {
        console.log(`⚠️  Found ${orphanedStores.rowCount} stores with no products (likely seed stores)`);
        console.log('Orphaned stores:');
        orphanedStores.rows.forEach(s => {
          console.log(`   - ${s.name} (${s.id})`);
        });

        console.log('\n🧹 Deleting orphaned seed stores...\n');
        
        // Get vendor count before deletion
        const orphanIds = orphanedStores.rows.map(s => s.id);
        const deleteStoresResult = await client.query(
          'DELETE FROM stores WHERE id = ANY($1)',
          [orphanIds]
        );
        console.log(`✅ Deleted ${deleteStoresResult.rowCount} orphaned stores\n`);
      }

      // Check if vendor user (vendor@test.com) has no stores
      const testVendor = await client.query(
        `SELECT users.id, users.email, COUNT(stores.id) as store_count 
         FROM users 
         LEFT JOIN stores ON users.id = stores."ownerId"
         WHERE users.email = 'vendor@test.com'
         GROUP BY users.id`
      );

      if (testVendor.rowCount > 0) {
        const vendor = testVendor.rows[0];
        if (vendor.store_count === 0) {
          console.log(`🧹 Test vendor (vendor@test.com) has no stores - removing test account...\n`);
          await client.query(`DELETE FROM users WHERE email = 'vendor@test.com'`);
          console.log(`✅ Deleted test vendor account\n`);
        }
      }
    }

    // Verify final state
    console.log('\n📊 FINAL DATA STATUS AFTER CLEANUP');
    console.log('═'.repeat(50));
    
    const finalStores = await client.query('SELECT COUNT(*) as count FROM stores');
    const finalProducts = await client.query('SELECT COUNT(*) as count FROM products');
    const finalUsers = await client.query('SELECT COUNT(*) as count FROM users');
    const finalOrders = await client.query('SELECT COUNT(*) as count FROM orders');

    console.log(`📍 Stores: ${finalStores.rows[0].count}`);
    console.log(`📦 Products: ${finalProducts.rows[0].count}`);
    console.log(`👥 Users: ${finalUsers.rows[0].count}`);
    console.log(`🛍️  Orders: ${finalOrders.rows[0].count}\n`);

    console.log('✅ Database cleanup complete!');
    console.log('⏭️  Next: Register new vendors and create real product data\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await client.end();
  }
}

inspectAndCleanDatabase();
