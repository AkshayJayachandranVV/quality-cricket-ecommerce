import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import dbConfig from '../config/db.config';
import { initUserModel, initProductModel, initOrderModel, initReviewModel, initCartModel, initAddressModel, initWalletTransactionModel, initFAQModel, UserModel, ProductModel, OrderModel, ReviewModel, CartModel, AddressModel, WalletTransactionModel, FAQModel } from './models';

dotenv.config();

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    logging: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
});

// Initialize Models
const User: typeof UserModel = initUserModel(sequelize);
const Product: typeof ProductModel = initProductModel(sequelize);
const Order: typeof OrderModel = initOrderModel(sequelize);
const Review: typeof ReviewModel = initReviewModel(sequelize);
const Cart: typeof CartModel = initCartModel(sequelize);
const Address: typeof AddressModel = initAddressModel(sequelize);
const WalletTransaction: typeof WalletTransactionModel = initWalletTransactionModel(sequelize);

// Define Associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Order, { foreignKey: 'productId', as: 'orders' });
Order.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Product, { foreignKey: 'vendorId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'vendorId', as: 'vendor' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Cart, { foreignKey: 'productId', as: 'cartEntries' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(WalletTransaction, { foreignKey: 'userId', as: 'walletTransactions' });
WalletTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const db = {
    sequelize,
    Sequelize,
    User,
    Product,
    Order,
    Review,
    Cart,
    Address,
    WalletTransaction,
    FAQ: initFAQModel(sequelize)
};

export default db;
