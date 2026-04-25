import { Request, Response, NextFunction } from 'express';
import db from '../models';

export const getMyAddresses = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const addresses = await db.Address.findAll({
            where: { userId: req.userId },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json({ addresses });
    } catch (err) {
        next(err);
    }
};

export const addAddress = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const { 
        fullName, mobileNumber, pincode, flatHouse, areaStreet, landmark, townCity, state, country, isDefault 
    } = req.body;

    try {
        // If this is set as default, unset other defaults
        if (isDefault) {
            await db.Address.update({ isDefault: false }, { where: { userId: req.userId } });
        }

        const address = await db.Address.create({
            userId: req.userId,
            fullName,
            mobileNumber,
            pincode,
            flatHouse,
            areaStreet,
            landmark,
            townCity,
            state,
            country: country || 'India',
            isDefault: isDefault || false
        });

        res.status(201).json({ message: 'Address added successfully', address });
    } catch (err) {
        next(err);
    }
};

export const updateAddress = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { isDefault } = req.body;

    try {
        const address = await db.Address.findOne({ where: { id: Number(id), userId: req.userId } });
        if (!address) {
            res.status(404).json({ message: 'Address not found' });
            return;
        }

        if (isDefault) {
            await db.Address.update({ isDefault: false }, { where: { userId: req.userId } });
        }

        await address.update(req.body);
        res.json({ message: 'Address updated successfully', address });
    } catch (err) {
        next(err);
    }
};

export const deleteAddress = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const deleted = await db.Address.destroy({ where: { id: Number(id), userId: req.userId } });
        if (!deleted) {
            res.status(404).json({ message: 'Address not found' });
            return;
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (err) {
        next(err);
    }
};
