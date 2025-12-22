const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'ecommerce_db',
  user: 'postgres',
  password: 'mthrx1z3'
});

async function checkProducts() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Count all products
    const total = await client.query('SELECT COUNT(*) FROM products');
    console.log(`\nTotal products: ${total.rows[0].count}`);
    
    // Count by approval status
    const byStatus = await client.query('SELECT "approvalStatus", COUNT(*) FROM products GROUP BY "approvalStatus"');
    console.log('\n=== PRODUCTS BY APPROVAL STATUS ===');
    byStatus.rows.forEach(row => {
      console.log(`${row.approvalStatus}: ${row.count}`);
    });
    
    // Get sample products
    const products = await client.query('SELECT id, name, price, "approvalStatus", country FROM products LIMIT 10');
    console.log('\n=== SAMPLE PRODUCTS ===');
    products.rows.forEach(p => {
      console.log(`ID: ${p.id}`);
      console.log(`Name: ${p.name}`);
      console.log(`Price: ${p.price}`);
      console.log(`Status: ${p.approvalStatus}`);
      console.log(`Country: ${p.country}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkProducts();
