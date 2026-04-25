import { body } from 'express-validator';

export const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category').trim().notEmpty().withMessage('Category is required'),
];
