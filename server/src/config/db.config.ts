import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
    HOST: process.env['DB_HOST'] as string,
    USER: process.env['DB_USER'] as string,
    PASSWORD: process.env['DB_PASSWORD'] as string,
    DB: process.env['DB_NAME'] as string,
    dialect: 'mysql' as const,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};

export default dbConfig;
