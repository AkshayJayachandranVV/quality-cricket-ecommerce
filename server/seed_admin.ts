import db from './src/models';
import bcrypt from 'bcrypt';

async function seedAdmin() {
    try {
        console.log('Seeding admin user...');
        
        const existing = await db.User.findOne({ where: { email: 'admin@gmail.com' } });
        if (existing) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash('admin', 10);
        
        await db.User.create({
            firstName: 'admin',
            lastName: 'admin',
            email: 'admin@gmail.com',
            phoneNumber: '0000000000', // Dummy phone number
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
