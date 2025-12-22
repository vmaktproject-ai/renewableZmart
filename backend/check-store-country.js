const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'ecommerce_db',
  user: 'postgres',
  password: 'mthrx1z3'
});

async function checkStoreCountry() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const result = await client.query('SELECT id, name, country, "isActive" FROM stores');
    
    console.log('\n=== STORE COUNTRIES ===');
    result.rows.forEach(store => {
      console.log(`${store.name} - Country: ${store.country} - Active: ${store.isActive}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkStoreCountry();
