const pg = require('pg');

// Render database connection
const renderClient = new pg.Client({
  host: process.env.RENDER_DATABASE_HOST || 'dpg-c0u4jj9f7o1s73c5c1pg-a.oregon-postgres.render.com',
  port: 5432,
  database: process.env.RENDER_DATABASE_NAME || 'renewablezmart_ecom',
  user: process.env.RENDER_DATABASE_USER || 'renewablezmart_user',
  password: process.env.RENDER_DATABASE_PASSWORD,
  ssl: true
});

async function checkDatabase() {
  try {
    await renderClient.connect();
    console.log('✅ Connected to Render database');

    // Check stores
    const storesResult = await renderClient.query('SELECT COUNT(*) as count FROM stores');
    const storeCount = storesResult.rows[0].count;
    console.log(`📊 Stores in Render: ${storeCount}`);

    // Check products
    const productsResult = await renderClient.query('SELECT COUNT(*) as count FROM products');
    const productCount = productsResult.rows[0].count;
    console.log(`📦 Products in Render: ${productCount}`);

    // List a sample of each
    if (storeCount > 0) {
      const storesData = await renderClient.query('SELECT id, name FROM stores LIMIT 2');
      console.log('Sample stores:');
      storesData.rows.forEach(s => console.log(`  - ${s.name} (${s.id.substring(0, 8)}...)`));
    }

    if (productCount > 0) {
      const productsData = await renderClient.query('SELECT id, name FROM products LIMIT 2');
      console.log('Sample products:');
      productsData.rows.forEach(p => console.log(`  - ${p.name} (${p.id.substring(0, 8)}...)`));
    } else {
      console.log('No products found - listing products table structure:');
      const columns = await renderClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products'
      `);
      console.log('Products table columns:');
      columns.rows.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
    }

    await renderClient.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
