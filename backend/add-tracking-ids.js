const { DataSource } = require('typeorm');

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'mthrx1z3',
  database: 'ecommerce_db',
  synchronize: false,
  logging: true,
});

async function addTrackingIdsToProducts() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    // Get all products without tracking IDs
    const products = await AppDataSource.query(
      'SELECT id, name FROM products WHERE "trackingId" IS NULL'
    );

    console.log(`\nFound ${products.length} products without tracking IDs\n`);

    if (products.length === 0) {
      console.log('All products already have tracking IDs!');
      await AppDataSource.destroy();
      return;
    }

    // Add tracking IDs to each product
    for (const product of products) {
      const trackingId = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      await AppDataSource.query(
        'UPDATE products SET "trackingId" = $1 WHERE id = $2',
        [trackingId, product.id]
      );

      console.log(`✓ Added tracking ID: ${trackingId} to product: ${product.name}`);
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`\n✓ Successfully added tracking IDs to ${products.length} products!\n`);

    await AppDataSource.destroy();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the function
addTrackingIdsToProducts();
