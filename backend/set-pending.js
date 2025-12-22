const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'ecommerce_db',
  user: 'postgres',
  password: 'mthrx1z3'
});

async function setProductsToPending() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check current products
    const products = await client.query('SELECT id, name, "approvalStatus" FROM products');
    console.log('\n=== Current Products ===');
    console.log(JSON.stringify(products.rows, null, 2));

    // Set all products to pending (they need admin approval)
    const updateResult = await client.query(`
      UPDATE products 
      SET "approvalStatus" = 'pending'
      WHERE "approvalStatus" = 'approved'
      RETURNING id, name, "approvalStatus"
    `);
    console.log('\n=== Updated Products to Pending ===');
    console.log(JSON.stringify(updateResult.rows, null, 2));

    console.log('\n✅ All products set to pending - require admin approval to show on landing page');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

setProductsToPending();
