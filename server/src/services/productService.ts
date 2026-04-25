import { Request, Response, NextFunction } from 'express';
import db from '../models';

export const getAllProducts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const products = await db.Product.findAll();
        res.json({ products });
    } catch (err) {
        next(err);
    }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const product = await db.Product.findByPk(Number(id), {
            include: [{
                model: db.Review,
                as: 'reviews',
                include: [{
                    model: db.User,
                    as: 'user',
                    attributes: ['firstName', 'lastName']
                }]
            }]
        });
        
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({ product });
    } catch (err) {
        next(err);
    }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { 
        name, 
        description, 
        basePrice, 
        stockQuantity, 
        sku, 
        discountPercentage, 
        category, 
        isCustomizable,
        size,
        color,
        tags,
        sizeChart
    } = req.body;

    try {
        if (Number(basePrice) < 0) {
            res.status(400).json({ message: 'Price cannot be negative' });
            return;
        }
        if (Number(stockQuantity) < 0) {
            res.status(400).json({ message: 'Stock quantity cannot be negative' });
            return;
        }

        const files = req.files as Express.Multer.File[];
        const imageUrls = files && files.length > 0 
            ? JSON.stringify(files.map(file => `/uploads/${file.filename}`))
            : null;

        const product = await db.Product.create({
            name,
            description,
            basePrice: Number(basePrice),
            stockQuantity: Number(stockQuantity),
            sku,
            discountPercentage: Number(discountPercentage || 0),
            category,
            isCustomizable: isCustomizable === 'true' || isCustomizable === true,
            imageUrls,
            size,
            color,
            tags,
            sizeChart
        } as any);

        res.status(201).json({ message: 'Product created successfully', product });
    } catch (err: any) {
        next(err);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const product = await db.Product.findByPk(Number(id));
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // Sanitize update data
        const { id: _, createdAt, updatedAt, vendorId, ...sanitizedData } = req.body;
        const updateData: any = {};
        
        // Remove 'null' strings and undefined values that cause DB errors
        Object.keys(sanitizedData).forEach(key => {
            if (sanitizedData[key] !== 'null' && sanitizedData[key] !== undefined && sanitizedData[key] !== 'undefined') {
                updateData[key] = sanitizedData[key];
            }
        });

        if (updateData.basePrice !== undefined && Number(updateData.basePrice) < 0) {
            res.status(400).json({ message: 'Price cannot be negative' });
            return;
        }

        // Handle Images
        const files = req.files as Express.Multer.File[];
        let finalImageUrls: string[] = [];

        // 1. Process existing images to keep
        if (req.body.imagesToKeep) {
            try {
                finalImageUrls = JSON.parse(req.body.imagesToKeep);
            } catch (e) {
                console.error("Error parsing imagesToKeep:", e);
            }
        } else if (!files || files.length === 0) {
            // If neither imagesToKeep nor new files are provided, maintain existing images
            // This handles the case where the client doesn't support selective deletion yet
            try {
                finalImageUrls = JSON.parse(product.imageUrls || "[]");
            } catch (e) {}
        }

        // 2. Append new uploads
        if (files && files.length > 0) {
            const newUrls = files.map(file => `/uploads/${file.filename}`);
            finalImageUrls = [...finalImageUrls, ...newUrls];
        }

        // 3. Save final array as JSON
        if (finalImageUrls.length > 0 || (req.body.imagesToKeep && JSON.parse(req.body.imagesToKeep).length === 0)) {
            updateData.imageUrls = JSON.stringify(finalImageUrls);
        }

        // Convert types
        if (updateData.basePrice !== undefined) updateData.basePrice = Number(updateData.basePrice);
        if (updateData.stockQuantity !== undefined) updateData.stockQuantity = Number(updateData.stockQuantity);
        if (updateData.discountPercentage !== undefined) updateData.discountPercentage = Number(updateData.discountPercentage);
        if (updateData.isCustomizable !== undefined) updateData.isCustomizable = updateData.isCustomizable === 'true' || updateData.isCustomizable === true;

        await product.update(updateData);
        res.json({ message: 'Product updated successfully', product });
    } catch (err: any) {
        next(err);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const deleted = await db.Product.destroy({ where: { id: Number(id) } });
        if (!deleted) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        next(err);
    }
};
