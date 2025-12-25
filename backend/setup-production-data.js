// Quick setup script to create real test data
const API_URL = 'https://renewablezmart-backend.onrender.com/api';

async function setupTestData() {
  try {
    console.log('📋 Setting up test data on production...\n');

    // 1. Register or login vendor
    console.log('1️⃣  Getting vendor credentials...');
    let token, vendorId;
    
    // Try login first
    let loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testvendor@renewablezmart.com',
        password: 'TestVendor123!@#'
      })
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      vendorId = loginData.user?.id;
      token = loginData.token || loginData.accessToken;
      console.log('✅ Logged in with existing vendor account');
    } else {
      // Register new vendor
      const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testvendor@renewablezmart.com',
          password: 'TestVendor123!@#',
          firstName: 'Test',
          lastName: 'Vendor',
          businessName: 'Test Renewable Store',
          role: 'vendor',
          country: 'Nigeria',
          city: 'Lagos'
        })
      });

      if (!registerRes.ok) {
        const error = await registerRes.json();
        throw new Error(`Registration failed: ${error.message || registerRes.statusText}`);
      }

      const registerData = await registerRes.json();
      vendorId = registerData.user?.id;
      token = registerData.token || registerData.accessToken;
      console.log('✅ Registered new vendor account');
    }

    if (!token) {
      throw new Error('No token obtained');
    }

    console.log(`✅ Vendor ID: ${vendorId}`);
    console.log(`✅ Token: ${token.substring(0, 20)}...`);

    // 2. Create a store
    console.log('\n2️⃣  Creating store...');
    const storeRes = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Renewable Energy Solutions Nigeria',
        description: 'Premium renewable energy products and solutions',
        country: 'Nigeria',
        city: 'Lagos',
        address: 'Lagos, Nigeria',
        phone: '+2348012345678'
      })
    });

    if (!storeRes.ok) {
      const error = await storeRes.json();
      throw new Error(`Store creation failed: ${error.message || storeRes.statusText}`);
    }

    const storeData = await storeRes.json();
    const storeId = storeData.id || storeData.store?.id;
    console.log(`✅ Store created: ${storeId}`);

    // 3. Create products
    console.log('\n3️⃣  Creating products...');
    const products = [
      {
        name: '5KW Solar Panel System Complete Kit',
        description: 'Complete 5KW solar panel system with inverter and controller. Perfect for residential use.',
        price: 850000,
        category: 'Solar Systems',
        stock: 15,
        images: []
      },
      {
        name: '10KW Hybrid Inverter',
        description: 'Advanced hybrid inverter with battery storage capability. Pure sine wave output.',
        price: 450000,
        category: 'Inverters',
        stock: 20,
        images: []
      },
      {
        name: '400Ah Lithium Battery Pack',
        description: 'LiFePO4 lithium battery 400Ah capacity for solar energy storage. 10-year warranty.',
        price: 1200000,
        category: 'Batteries',
        stock: 8,
        images: []
      },
      {
        name: 'Solar Water Pump System 2HP',
        description: '2HP solar-powered water pump with controller. Ideal for farms and homes.',
        price: 320000,
        category: 'Water Systems',
        stock: 25,
        images: []
      },
      {
        name: 'Wind Turbine 3KW Residential',
        description: 'Efficient 3KW wind turbine for residential areas. Quiet operation, low maintenance.',
        price: 1400000,
        category: 'Wind Energy',
        stock: 5,
        images: []
      },
      {
        name: 'Solar Charge Controller MPPT 100A',
        description: 'Advanced MPPT solar charge controller. Maximum power point tracking for efficiency.',
        price: 280000,
        category: 'Controllers',
        stock: 30,
        images: []
      }
    ];

    let createdProducts = 0;
    for (const product of products) {
      const prodRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...product,
          storeId,
          country: 'Nigeria',
          city: 'Lagos'
        })
      });

      if (prodRes.ok) {
        console.log(`   ✅ ${product.name}`);
        createdProducts++;
      } else {
        const error = await prodRes.json();
        console.log(`   ❌ ${product.name}: ${error.message}`);
      }
    }

    console.log(`\n✅ Created ${createdProducts} products`);

    // 4. Check final status
    console.log('\n4️⃣  Verifying...');
    const statusRes = await fetch(`${API_URL}/database-status`);
    const status = await statusRes.json();
    console.log(`📊 Final database state:`);
    console.log(`   Stores: ${status.data.stores}`);
    console.log(`   Products: ${status.data.products}`);
    console.log(`   Users: ${status.data.users}`);

    console.log('\n✅ Setup complete! Production database is ready with real data.');

  } catch (error) {
    console.error('❌ Setup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

setupTestData();
