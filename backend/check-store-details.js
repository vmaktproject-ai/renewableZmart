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
    
    const result = await client.query('SELECT id, name, slug, country, city, state, description FROM stores');
    
    console.log('\n=== STORE DETAILS ===');
    console.log(`Total stores: ${result.rows.length}\n`);
    
    result.rows.forEach(store => {
      console.log(`Name: ${store.name}`);
      console.log(`Country: ${store.country}`);
      console.log(`City: ${store.city}`);
      console.log(`State: ${store.state}`);
      console.log(`Description: ${store.description}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkStores();
