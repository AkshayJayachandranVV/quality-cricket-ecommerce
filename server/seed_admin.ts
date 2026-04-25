import db from './src/models';
import bcrypt from 'bcrypt';

async function seedAdmin() {
    try {
        console.log('Seeding admin user...');
        
        const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@qualitycricket.com';
        const existing = await db.User.findOne({ where: { email: adminEmail } });
        if (existing) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const password = process.env['ADMIN_PASSWORD'] || 'admin@123';
        const passwordHash = await bcrypt.hash(password, 10);
        
        await db.User.create({
            firstName: 'System',
            lastName: 'Admin',
            email: adminEmail,
            phoneNumber: '0000000000',
            passwordHash,
            role: 'Admin',
            isVerified: true
        });

        console.log('✅ Admin user created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedAdmin();
