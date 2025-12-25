const pg = require('pg');

const client = new pg.Client({
  host: 'dpg-c0u4jj9f7o1s73c5c1pg-a.oregon-postgres.render.com',
  port: 5432,
  database: 'renewablezmart_ecom',
  user: 'renewablezmart_user',
  password: process.env.RENDER_DB_PASSWORD || 'xmEt8cCdUnvKyHZ_',
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

    // 5. Check for seed data
    console.log('\n🌱 CHECKING FOR SEED DATA...');
    console.log('═'.repeat(50));
    
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
    console.log(`🌱 Seed products detected: ${seedCount}`);

    // Check for test vendor
    const testVendorQuery = await client.query(
      `SELECT COUNT(*) as count FROM users WHERE email = 'vendor@test.com'`
    );
    const testVendorCount = parseInt(testVendorQuery.rows[0].count);
    console.log(`🧪 Test vendor (vendor@test.com) count: ${testVendorCount}\n`);

    // 6. Show cleanup actions available
    console.log('🧹 AVAILABLE CLEANUP ACTIONS:');
    console.log('═'.repeat(50));
    if (seedCount > 0) {
      console.log(`✓ Can remove ${seedCount} seed products`);
    }
    if (testVendorCount > 0) {
      console.log('✓ Can remove test vendor account (vendor@test.com)');
    }

    // Propose cleanup
    if (seedCount > 0 || testVendorCount > 0) {
      console.log('\n💡 RECOMMENDATION: Run cleanup to remove seed data\n');
    } else {
      console.log('\n✅ Database is clean - no seed data found\n');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await client.end();
  }
}

inspectAndCleanDatabase();
