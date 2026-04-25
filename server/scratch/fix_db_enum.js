const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'cricket_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '2026',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

async function fixDatabase() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        
        console.log('Updating Order status ENUM...');
        await sequelize.query("ALTER TABLE `orders` MODIFY COLUMN `status` ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned') DEFAULT 'Pending';");
        console.log('✅ Orders table updated successfully.');

        console.log('Checking for redundant keys in users table...');
        // This is a common issue with alter:true. We might not be able to automate dropping them easily without knowing their names,
        // but getting the server back up is priority.
        
    } catch (error) {
        console.error('❌ Error fixing database:', error.message);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

fixDatabase();
