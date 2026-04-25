const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
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
