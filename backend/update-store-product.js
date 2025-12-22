const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'ecommerce_db',
  user: 'postgres',
  password: 'mthrx1z3'
});

async function updateStoreAndProducts() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check current status
    const stores = await client.query('SELECT id, name, slug, "ownerId", "isVerified", "verificationStatus", "isActive" FROM stores');
    console.log('\n=== Current Stores ===');
    console.log(JSON.stringify(stores.rows, null, 2));

    const products = await client.query('SELECT id, name, "storeId", "approvalStatus" FROM products');
    console.log('\n=== Current Products ===');
    console.log(JSON.stringify(products.rows, null, 2));

    // Update stores to be verified and active
    const updateStore = await client.query(`
      UPDATE stores 
      SET "isVerified" = true, 
          "verificationStatus" = 'approved', 
          "isActive" = true
      WHERE "verificationStatus" = 'pending'
      RETURNING id, name, "isVerified", "verificationStatus"
    `);
    console.log('\n=== Updated Stores ===');
    console.log(JSON.stringify(updateStore.rows, null, 2));

    // Update products to be approved
    const updateProduct = await client.query(`
      UPDATE products 
      SET "approvalStatus" = 'approved'
      WHERE "approvalStatus" = 'pending'
      RETURNING id, name, "approvalStatus"
    `);
    console.log('\n=== Updated Products ===');
    console.log(JSON.stringify(updateProduct.rows, null, 2));

    console.log('\n✅ Store and products updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

updateStoreAndProducts();
