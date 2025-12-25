import { AppDataSource } from '../config/database';

export async function forceInsertProducts() {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database connection...');
      await AppDataSource.initialize();
    }

    console.log('Step 1: Checking store count...');
    const storeCountResult = await AppDataSource.query('SELECT COUNT(*) as count FROM stores');
    const storeCount = parseInt(storeCountResult[0].count);
    console.log(`✅ Store count: ${storeCount}`);

    if (storeCount === 0) {
      console.log('❌ No stores found. Cannot seed products without stores.');
      return { ok: false, message: 'No stores found' };
    }

    // Get all store IDs
    console.log('Step 2: Fetching store IDs...');
    const storesData = await AppDataSource.query('SELECT id FROM stores');
    const storeIds = storesData.map((s: any) => s.id);
    console.log(`✅ Found ${storeIds.length} stores`);

    const products = [
      { name: '500W Solar Panel Kit', description: 'High-efficiency 500W solar panel with mounting bracket', price: 450000, category: 'Solar Panels', stock: 25 },
      { name: '5KW Inverter System', description: 'Pure sine wave 5KW inverter for power backup', price: 650000, category: 'Inverters', stock: 15 },
      { name: '200Ah Lithium Battery', description: 'LiFePO4 200Ah battery for energy storage', price: 850000, category: 'Batteries', stock: 10 },
      { name: 'Solar Water Pump', description: 'Efficient 1HP solar water pump', price: 280000, category: 'Water Systems', stock: 20 },
      { name: '2KW Wind Turbine', description: 'Compact 2KW wind turbine for residential use', price: 920000, category: 'Wind Energy', stock: 8 },
      { name: 'Hybrid Solar Inverter 3KW', description: '3KW hybrid solar inverter with MPPT', price: 520000, category: 'Inverters', stock: 12 },
      { name: '150W Solar Light Kit', description: 'Complete 150W solar lighting system', price: 120000, category: 'Lighting', stock: 40 },
      { name: 'Wind Charge Controller', description: '60A wind charge controller', price: 180000, category: 'Controllers', stock: 8 }
    ];

    console.log(`Step 3: Beginning product insertion (${products.length} products × ${storeIds.length} stores = ${products.length * storeIds.length} total)`);

    let totalInserted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (let storeIndex = 0; storeIndex < storeIds.length; storeIndex++) {
      const storeId = storeIds[storeIndex];
      console.log(`  [${storeIndex + 1}/${storeIds.length}] Processing store: ${storeId.substring(0, 8)}...`);
      
      for (let prodIndex = 0; prodIndex < products.length; prodIndex++) {
        const product = products[prodIndex];
        try {
          // Check if exists
          const existing = await AppDataSource.query(
            'SELECT id FROM products WHERE name = $1 AND "storeId" = $2',
            [product.name, storeId]
          );

          if (existing && existing.length > 0) {
            totalSkipped++;
            console.log(`    ⏭️  ${product.name} (already exists)`);
            continue;
          }

          // Insert
          const result = await AppDataSource.query(`
            INSERT INTO products (name, description, price, category, stock, "storeId", country, city, "approvalStatus", "isActive", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, 'Nigeria', 'Lagos', 'approved', true, NOW(), NOW())
            RETURNING id
          `, [product.name, product.description, product.price, product.category, product.stock, storeId]);
          
          if (result && result.length > 0) {
            totalInserted++;
            console.log(`    ✅ ${product.name} (id: ${result[0].id.substring(0, 8)}...)`);
          }
        } catch (err: any) {
          totalErrors++;
          console.error(`    ❌ ${product.name}: ${err.message}`);
        }
      }
    }

    // Verify
    console.log('Step 4: Verifying product count...');
    const finalCount = await AppDataSource.query('SELECT COUNT(*) as count FROM products');
    const finalProductCount = parseInt(finalCount[0].count);

    console.log(`✅ Insertion complete: ${totalInserted} inserted, ${totalSkipped} skipped, ${totalErrors} errors`);
    console.log(`📦 Final product count in database: ${finalProductCount}`);

    return {
      ok: true,
      message: `Successfully seeded products`,
      stats: {
        inserted: totalInserted,
        skipped: totalSkipped,
        errors: totalErrors,
        total: finalProductCount,
        stores: storeIds.length
      }
    };

  } catch (error: any) {
    console.error('❌ Force insert error:', error.message);
    console.error('Stack:', error.stack);
    return { ok: false, message: error.message };
  }
}
