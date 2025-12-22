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

async function createVendorStore() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Find vendor users without stores
    const vendors = await AppDataSource.query(`
      SELECT u.id, u.email, u."firstName", u."lastName", u."businessName", u.country, u.city
      FROM users u
      LEFT JOIN stores s ON s."ownerId" = u.id
      WHERE u.role = 'vendor' AND s.id IS NULL
    `);

    console.log(`Found ${vendors.length} vendors without stores`);

    for (const vendor of vendors) {
      const storeName = vendor.businessName || `${vendor.firstName} ${vendor.lastName}'s Store`;
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      await AppDataSource.query(`
        INSERT INTO stores (name, description, "ownerId", slug, country, city, "isActive", "isVerified", "verificationStatus", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, true, false, 'pending', NOW(), NOW())
      `, [
        storeName,
        `Official store for ${storeName}`,
        vendor.id,
        slug + '-' + Date.now(),
        vendor.country || 'Nigeria',
        vendor.city || 'Lagos'
      ]);
      
      console.log(`✅ Created store for ${vendor.email}: ${storeName}`);
    }

    await AppDataSource.destroy();
    console.log('\n✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createVendorStore();
