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
    
    const users = await AppDataSource.query(
      `SELECT id, email, role, "businessName", "firstName", "lastName", country, city FROM users WHERE email = $1`,
      ['man@gmail.com']
    );
    
    console.log('User data:', JSON.stringify(users, null, 2));
    
    if (users.length > 0) {
      const user = users[0];
      const stores = await AppDataSource.query(
        `SELECT * FROM stores WHERE "ownerId" = $1`,
        [user.id]
      );
      console.log('User stores:', JSON.stringify(stores, null, 2));
    }
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
