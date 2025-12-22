const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'ecommerce_db',
  user: 'postgres',
  password: 'mthrx1z3'
});

async function checkStoreProducts() {
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // Check products with storeId
    const result = await client.query(`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p."approvalStatus",
        p."storeId",
        s.name as store_name,
        s.slug as store_slug
      FROM products p
      LEFT JOIN stores s ON p."storeId" = s.id
      ORDER BY p."createdAt" DESC
    `);
    
    console.log('=== PRODUCTS AND THEIR STORES ===');
    console.log(`Total products: ${result.rows.length}\n`);
    
    let withStore = 0;
    let withoutStore = 0;
    
    result.rows.forEach(product => {
      console.log(`Product: ${product.name}`);
      console.log(`Price: ₦${product.price}`);
      console.log(`Status: ${product.approvalStatus}`);
      if (product.storeId) {
        console.log(`✅ Store: ${product.store_name} (${product.store_slug})`);
        console.log(`   Store ID: ${product.storeId}`);
        withStore++;
      } else {
        console.log(`❌ No Store Assigned`);
        withoutStore++;
      }
      console.log('---\n');
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Products with store: ${withStore}`);
    console.log(`Products without store: ${withoutStore}`);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
  }
}

checkStoreProducts();
