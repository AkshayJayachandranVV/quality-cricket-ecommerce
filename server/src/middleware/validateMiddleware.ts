import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation results from express-validator.
 * Returns 400 with errors if any validation failed.
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.array().map(err => ({
                field: (err as any).path,
                message: err.msg
            }))
        });
    }
    next();
};
