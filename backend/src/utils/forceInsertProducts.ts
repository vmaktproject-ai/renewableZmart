import { AppDataSource } from '../config/database';

export async function forceInsertProducts() {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database connection...');
      await AppDataSource.initialize();
    }

    const storeCountResult = await AppDataSource.query('SELECT COUNT(*) as count FROM stores');
    const storeCount = parseInt(storeCountResult[0].count);

    if (storeCount === 0) {
      console.log('❌ No stores found. Cannot seed products without stores.');
      return { ok: false, message: 'No stores found' };
    }

    // Get all store IDs
    const storesData = await AppDataSource.query('SELECT id FROM stores');
    const storeIds = storesData.map((s: any) => s.id);
    console.log(`📊 Found ${storeIds.length} stores: ${storeIds.map((id: string) => id.substring(0,8)).join(', ')}`);

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

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const storeId of storeIds) {
      for (const product of products) {
        try {
          // Check if exists
          const existing = await AppDataSource.query(
            'SELECT id FROM products WHERE name = $1 AND "storeId" = $2',
            [product.name, storeId]
          );

          if (existing && existing.length > 0) {
            totalSkipped++;
            continue;
          }

          // Insert
          await AppDataSource.query(`
            INSERT INTO products (name, description, price, category, stock, "storeId", country, city, "approvalStatus", "isActive", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, 'Nigeria', 'Lagos', 'approved', true, NOW(), NOW())
          `, [product.name, product.description, product.price, product.category, product.stock, storeId]);
          
          totalInserted++;
        } catch (err: any) {
          console.error(`Failed to insert ${product.name}: ${err.message}`);
        }
      }
    }

    // Verify
    const finalCount = await AppDataSource.query('SELECT COUNT(*) as count FROM products');
    const finalProductCount = parseInt(finalCount[0].count);

    console.log(`✅ Insertion complete: ${totalInserted} inserted, ${totalSkipped} skipped`);
    console.log(`📦 Total products in database: ${finalProductCount}`);

    return {
      ok: true,
      message: `Successfully seeded products`,
      stats: {
        inserted: totalInserted,
        skipped: totalSkipped,
        total: finalProductCount,
        stores: storeIds.length
      }
    };

  } catch (error: any) {
    console.error('❌ Force insert error:', error.message);
    return { ok: false, message: error.message };
  }
}
