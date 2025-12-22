const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'ecommerce_db',
  user: 'postgres',
  password: 'mthrx1z3'
});

async function checkStores() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const result = await client.query('SELECT id, name, slug, "isActive", "isVerified", "verificationStatus" FROM stores');
    
    console.log('\n=== STORES IN DATABASE ===');
    console.log(`Total stores: ${result.rows.length}\n`);
    
    result.rows.forEach(store => {
      console.log(`ID: ${store.id}`);
      console.log(`Name: ${store.name}`);
      console.log(`Slug: ${store.slug}`);
      console.log(`Active: ${store.isActive}`);
      console.log(`Verified: ${store.isVerified}`);
      console.log(`Status: ${store.verificationStatus}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkStores();
