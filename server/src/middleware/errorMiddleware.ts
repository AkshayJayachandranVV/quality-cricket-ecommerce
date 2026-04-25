import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);

    let status = err.status || 500;
    let message = err.message || 'An unexpected error occurred';

    // Handle Sequelize specific errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        status = 400;
        const field = err.errors[0].path;
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a unique value.`;
        
        // Custom mapping for SKU
        if (field === 'sku') {
            message = 'SKU is already in use. Please use a unique SKU.';
        }
    } else if (err.name === 'SequelizeValidationError') {
        status = 400;
        message = err.errors[0].message;
    } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        status = 400;
        message = 'Referenced record not found.';
    }

    res.status(status).json({
        message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
