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
    console.log('Connected to database');

    const email = 'man@gmail.com';
    const newPassword = '12345678';
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await AppDataSource.query(
      'UPDATE users SET password = $1 WHERE LOWER(email) = LOWER($2)',
      [hashedPassword, email]
    );
    
    console.log(`✅ Password reset for ${email}`);
    console.log(`New password: ${newPassword}`);
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPassword();
