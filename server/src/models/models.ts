import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

// ─── Attribute Interfaces ────────────────────────────────────────────────────

export interface UserAttributes {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    role: 'Admin' | 'Vendor' | 'Customer';
    walletBalance?: number;
    otp?: string | null;
    otpExpiry?: Date | null;
    isVerified?: boolean;
    isBlocked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductAttributes {
    id?: number;
    vendorId?: number;
    name: string;
    description: string;
    basePrice: number;
    stockQuantity: number;
    sku: string;
    discountPercentage: number;
    category: string;
    isCustomizable: boolean;
    imageUrls?: string; // Stored as JSON string
    size?: string;
    color?: string;
    tags?: string;
    sizeChart?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OrderAttributes {
    id?: number;
    userId?: number;
    productId?: number; // Single product buy now
    quantity: number;
    totalAmount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
    trackingId?: string;
    paymentStatus: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    shippingAddress?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface WalletTransactionAttributes {
    id?: number;
    userId: number;
    orderId?: number;
    amount: number;
    type: 'Credit' | 'Debit';
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CartAttributes {
    id?: number;
    userId: number;
    productId: number;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ReviewAttributes {
    id?: number;
    productId: number;
    userId: number;
    rating: number;
    comment: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AddressAttributes {
    id?: number;
    userId: number;
    fullName: string;
    mobileNumber: string;
    pincode: string;
    flatHouse: string;
    areaStreet: string;
    landmark?: string;
    townCity: string;
    state: string;
    country: string;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface FAQAttributes {
    id?: number;
    question: string;
    answer: string;
    category: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// ─── Model Classes ────────────────────────────────────────────────────────────

export class UserModel extends Model<UserAttributes, Optional<UserAttributes, 'id'>> implements UserAttributes {
    public id!: number;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public phoneNumber!: string;
    public passwordHash!: string;
    public role!: 'Admin' | 'Vendor' | 'Customer';
    public walletBalance!: number;
    public otp!: string | null;
    public otpExpiry!: Date | null;
    public isVerified!: boolean;
    public isBlocked!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export class ProductModel extends Model<ProductAttributes, Optional<ProductAttributes, 'id'>> implements ProductAttributes {
    public id!: number;
    public vendorId!: number;
    public name!: string;
    public description!: string;
    public basePrice!: number;
    public stockQuantity!: number;
    public sku!: string;
    public discountPercentage!: number;
    public category!: string;
    public isCustomizable!: boolean;
    public imageUrls!: string;
    public size!: string;
    public color!: string;
    public tags!: string;
    public sizeChart!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export class OrderModel extends Model<OrderAttributes, Optional<OrderAttributes, 'id'>> implements OrderAttributes {
    public id!: number;
    public userId!: number;
    public productId!: number;
    public quantity!: number;
    public totalAmount!: number;
    public status!: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
    public trackingId!: string;
    public paymentStatus!: string;
    public razorpayOrderId!: string;
    public razorpayPaymentId!: string;
    public shippingAddress!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public user?: UserModel;
    public product?: ProductModel;
}

export class WalletTransactionModel extends Model<WalletTransactionAttributes, Optional<WalletTransactionAttributes, 'id'>> implements WalletTransactionAttributes {
    public id!: number;
    public userId!: number;
    public orderId!: number;
    public amount!: number;
    public type!: 'Credit' | 'Debit';
    public description!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export class CartModel extends Model<CartAttributes, Optional<CartAttributes, 'id'>> implements CartAttributes {
    public id!: number;
    public userId!: number;
    public productId!: number;
    public quantity!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export class ReviewModel extends Model<ReviewAttributes, Optional<ReviewAttributes, 'id'>> implements ReviewAttributes {
    public id!: number;
    public productId!: number;
    public userId!: number;
    public rating!: number;
    public comment!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export class AddressModel extends Model<AddressAttributes, Optional<AddressAttributes, 'id'>> implements AddressAttributes {
    public id!: number;
    public userId!: number;
    public fullName!: string;
    public mobileNumber!: string;
    public pincode!: string;
    public flatHouse!: string;
    public areaStreet!: string;
    public landmark!: string;
    public townCity!: string;
    public state!: string;
    public country!: string;
    public isDefault!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}
export class FAQModel extends Model<FAQAttributes, Optional<FAQAttributes, 'id'>> implements FAQAttributes {
    public id!: number;
    public question!: string;
    public answer!: string;
    public category!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// ─── Initializers ─────────────────────────────────────────────────────────────

export function initUserModel(sequelize: Sequelize) {
    UserModel.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            firstName: { type: DataTypes.STRING, allowNull: false },
            lastName: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, unique: true, allowNull: false },
            phoneNumber: { type: DataTypes.STRING, unique: true },
            passwordHash: { type: DataTypes.STRING },
            role: { type: DataTypes.ENUM('Admin', 'Vendor', 'Customer'), defaultValue: 'Customer' },
            walletBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
            otp: { type: DataTypes.STRING, allowNull: true },
            otpExpiry: { type: DataTypes.DATE, allowNull: true },
            isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
            isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        { sequelize, tableName: 'users' }
    );
    return UserModel;
}

export function initProductModel(sequelize: Sequelize) {
    ProductModel.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            vendorId: { type: DataTypes.INTEGER },
            name: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT },
            basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
            sku: { type: DataTypes.STRING, unique: true },
            discountPercentage: { type: DataTypes.INTEGER, defaultValue: 0 },
            category: { type: DataTypes.STRING },
            isCustomizable: { type: DataTypes.BOOLEAN, defaultValue: false },
            imageUrls: { type: DataTypes.TEXT, allowNull: true },
            size: { type: DataTypes.STRING, allowNull: true },
            color: { type: DataTypes.STRING, allowNull: true },
            tags: { type: DataTypes.STRING, allowNull: true },
            sizeChart: { type: DataTypes.STRING, allowNull: true },
        },
        { sequelize, tableName: 'products' }
    );
    return ProductModel;
}

export function initOrderModel(sequelize: Sequelize) {
    OrderModel.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER },
            productId: { type: DataTypes.INTEGER },
            quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
            totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            status: {
                type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'),
                defaultValue: 'Pending',
            },
            trackingId: { type: DataTypes.STRING },
            paymentStatus: { type: DataTypes.STRING, defaultValue: 'Unpaid' },
            razorpayOrderId: { type: DataTypes.STRING },
            razorpayPaymentId: { type: DataTypes.STRING },
            shippingAddress: { type: DataTypes.TEXT },
        },
        { sequelize, tableName: 'orders' }
    );
    return OrderModel;
}

export function initCartModel(sequelize: Sequelize) {
    CartModel.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            productId: { type: DataTypes.INTEGER, allowNull: false },
            quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
        },
        { sequelize, tableName: 'cart' }
    );
    return CartModel;
}

export function initReviewModel(sequelize: Sequelize) {
    ReviewModel.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            productId: { type: DataTypes.INTEGER, allowNull: false },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            rating: { type: DataTypes.INTEGER, allowNull: false },
            comment: { type: DataTypes.TEXT },
        },
        { sequelize, tableName: 'reviews' }
    );
    return ReviewModel;
}

export function initAddressModel(sequelize: Sequelize) {
    AddressModel.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            fullName: { type: DataTypes.STRING, allowNull: false },
            mobileNumber: { type: DataTypes.STRING, allowNull: false },
            pincode: { type: DataTypes.STRING, allowNull: false },
            flatHouse: { type: DataTypes.STRING, allowNull: false },
            areaStreet: { type: DataTypes.STRING, allowNull: false },
            landmark: { type: DataTypes.STRING, allowNull: true },
            townCity: { type: DataTypes.STRING, allowNull: false },
            state: { type: DataTypes.STRING, allowNull: false },
            country: { type: DataTypes.STRING, allowNull: false, defaultValue: 'India' },
            isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        { sequelize, tableName: 'addresses' }
    );
    return AddressModel;
}
export function initFAQModel(sequelize: Sequelize) {
    FAQModel.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            question: { type: DataTypes.TEXT, allowNull: false },
            answer: { type: DataTypes.TEXT, allowNull: false },
            category: { type: DataTypes.STRING, defaultValue: 'General' },
        },
        { sequelize, tableName: 'faqs' }
    );
    return FAQModel;
}

export function initWalletTransactionModel(sequelize: Sequelize) {
    WalletTransactionModel.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            orderId: { type: DataTypes.INTEGER, allowNull: true },
            amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            type: { type: DataTypes.ENUM('Credit', 'Debit'), allowNull: false },
            description: { type: DataTypes.STRING, allowNull: false },
        },
        { sequelize, tableName: 'wallet_transactions' }
    );
    return WalletTransactionModel;
}
