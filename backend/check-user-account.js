require('reflect-metadata');
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'mthrx1z3',
  database: 'ecommerce_db',
  synchronize: false,
});

async function checkUser() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database\n');

    const user = await AppDataSource.query(`
      SELECT id, email, password, "firstName", "lastName", role, "isVerified", country, city
      FROM users 
      WHERE email = $1
    `, ['kuburashedu2@gmail.com']);
    
    if (user.length > 0) {
      const u = user[0];
      console.log('✅ ACCOUNT FOUND!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:', u.email);
      console.log('Name:', u.firstName, u.lastName);
      console.log('Role:', u.role);
      console.log('Country:', u.country);
      console.log('City:', u.city);
      console.log('Verified:', u.isVerified);
      console.log('Password Hash (first 30 chars):', u.password.substring(0, 30) + '...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('❌ Account NOT found in database');
      console.log('\nAll registered accounts:');
      const allUsers = await AppDataSource.query(`
        SELECT email, "firstName", "lastName", role FROM users
      `);
      allUsers.forEach(u => {
        console.log(`  • ${u.email} (${u.role}) - ${u.firstName} ${u.lastName}`);
      });
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
