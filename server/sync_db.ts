import db from './src/models';

async function sync() {
    try {
        console.log('Starting DB sync with alter: true...');
        await db.sequelize.sync({ alter: true });
        console.log('✅ DB sync successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ DB sync failed:', error);
        process.exit(1);
    }
}

sync();
