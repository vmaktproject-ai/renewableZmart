const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'mthrx1z3',
  host: '127.0.0.1',
  port: 5432,
});

async function checkDatabases() {
  try {
    console.log('\n📊 Checking PostgreSQL Databases...\n');
    const result = await pool.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname;
    `);

    console.log('Available Databases:');
    result.rows.forEach(row => {
      console.log(`  - ${row.datname}`);
    });

    // Check if ecommerce_db exists
    const dbExists = result.rows.some(row => row.datname === 'ecommerce_db');
    console.log(`\n✓ ecommerce_db exists: ${dbExists ? 'YES ✅' : 'NO ❌'}`);

    if (!dbExists) {
      console.log('\n⚠️  Creating ecommerce_db...');
      await pool.query('CREATE DATABASE ecommerce_db;');
      console.log('✅ ecommerce_db created successfully!');
    }

    // Now connect to ecommerce_db and check tables
    const dbPool = new Pool({
      user: 'postgres',
      password: 'mthrx1z3',
      host: '127.0.0.1',
      port: 5432,
      database: 'ecommerce_db',
    });

    const tablesResult = await dbPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Tables in ecommerce_db:');
    if (tablesResult.rows.length === 0) {
      console.log('  ⚠️  No tables found! (Database is empty)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }

    // Check user count if users table exists
    if (tablesResult.rows.some(row => row.table_name === 'users')) {
      const userCount = await dbPool.query('SELECT COUNT(*) FROM users;');
      console.log(`\n👥 User Count: ${userCount.rows[0].count}`);
    }

    await dbPool.end();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabases();
