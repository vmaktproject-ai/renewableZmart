require('reflect-metadata');
const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'mthrx1z3',
  database: 'ecommerce_db',
  synchronize: false,
});

async function fixPasswords() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    // Hash the correct password
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('✅ Password hashed');

    // Update existing vendor account
    await AppDataSource.query(`
      UPDATE users 
      SET password = $1
      WHERE email = 'vendor@test.com'
    `, [hashedPassword]);
    
    console.log('✅ Updated vendor@test.com password');

    // Test: Verify the password can be compared
    const user = await AppDataSource.query(`
      SELECT email, password FROM users WHERE email = 'vendor@test.com' LIMIT 1
    `);

    if (user.length > 0) {
      const isValid = await bcrypt.compare('password123', user[0].password);
      console.log(`✅ Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      if (isValid) {
        console.log('\n✅ Account is ready to login!');
        console.log('Email: vendor@test.com');
        console.log('Password: password123');
      }
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPasswords();
