import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User, UserRole, AdminLevel } from '../models/User';
import bcrypt from 'bcrypt';

async function createAdminUsers() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('000000', 10);

    // Admin users to create
    const admins = [
      {
        email: 'SA00@renewablezmart.com',
        firstName: 'Super',
        lastName: 'Admin',
        adminLevel: AdminLevel.SA00,
        description: 'Super Admin - Highest level (Password changes, Financial approvals, PaySmallSmall approvals)'
      },
      {
        email: 'SA10@renewablezmart.com',
        firstName: 'Assistant',
        lastName: 'Admin',
        adminLevel: AdminLevel.SA10,
        description: 'Assistant Admin (Product approvals for vendor stores)'
      },
      {
        email: 'SA20@renewablezmart.com',
        firstName: 'Normal',
        lastName: 'Admin',
        adminLevel: AdminLevel.SA20,
        description: 'Normal Admin (Product approvals for vendor stores)'
      }
    ];

    console.log('\n🔐 Creating Admin Accounts...\n');

    for (const adminData of admins) {
      // Check if admin already exists
      const existingAdmin = await userRepository.findOne({
        where: { email: adminData.email }
      });

      if (existingAdmin) {
        console.log(`⚠️  ${adminData.adminLevel} already exists: ${adminData.email}`);
        continue;
      }

      // Create admin user
      const adminUser = userRepository.create({
        email: adminData.email,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        phone: '+2348000000000',
        country: 'Nigeria',
        city: 'Lagos',
        role: UserRole.ADMIN,
        adminLevel: adminData.adminLevel,
      });

      await userRepository.save(adminUser);
      console.log(`✅ ${adminData.adminLevel} created: ${adminData.email}`);
      console.log(`   ${adminData.description}`);
    }

    console.log('\n📋 Admin Login Credentials Summary:');
    console.log('=====================================');
    console.log('\n🔴 SA00 - Super Admin (Highest Authority)');
    console.log('   Email: SA00@renewablezmart.com');
    console.log('   Password: 000000');
    console.log('   Permissions: Password changes, Financial approvals, PaySmallSmall approvals\n');
    
    console.log('🟠 SA10 - Assistant Admin');
    console.log('   Email: SA10@renewablezmart.com');
    console.log('   Password: 000000');
    console.log('   Permissions: Product approvals for vendor stores\n');
    
    console.log('🟡 SA20 - Normal Admin');
    console.log('   Email: SA20@renewablezmart.com');
    console.log('   Password: 000000');
    console.log('   Permissions: Product approvals for vendor stores\n');
    
    console.log('⚠️  IMPORTANT NOTES:');
    console.log('   • Only SA00 can change admin passwords');
    console.log('   • Only SA00 can approve financial transactions');
    console.log('   • Only SA00 can approve PaySmallSmall requests');
    console.log('   • SA10 and SA20 can approve product displays');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    process.exit(1);
  }
}

createAdminUsers();
