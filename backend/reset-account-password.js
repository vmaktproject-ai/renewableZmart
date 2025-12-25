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

async function resetPassword() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database\n');

    // Hash the test password
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log('✅ Password hashed');

    // Update the password
    const result = await AppDataSource.query(`
      UPDATE users 
      SET password = $1
      WHERE email = $2
      RETURNING email, "firstName", "lastName"
    `, [hashedPassword, 'kuburasedu2@gmail.com']);

    if (result.length > 0) {
      console.log('\n✅ PASSWORD RESET SUCCESSFUL!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:', result[0].email);
      console.log('Name:', result[0].firstName, result[0].lastName);
      console.log('New Password:', testPassword);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📝 Login Instructions:');
      console.log('1. Go to http://localhost:3000/login');
      console.log('2. Email: kuburasedu2@gmail.com');
      console.log('3. Password: password123');
      
      // Verify the password works
      const verify = await bcrypt.compare(testPassword, hashedPassword);
      console.log('\n✅ Password verification:', verify ? 'SUCCESS' : 'FAILED');
    } else {
      console.log('❌ Account not found!');
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
