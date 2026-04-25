import { addToCart, getCart, placeOrderWithWallet } from '../orderService';
import db from '../../models';
import * as walletService from '../walletService';

jest.mock('../../models', () => ({
  Cart: {
    findOrCreate: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  Product: {
    findByPk: jest.fn(),
  },
  Order: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../walletService', () => ({
  creditWallet: jest.fn(),
  debitWallet: jest.fn(),
}));

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should create new cart item if it does not exist', async () => {
      (db.Cart.findOrCreate as jest.Mock).mockResolvedValue([{ quantity: 2, save: jest.fn() }, true]);

      const result = await addToCart(1, 101, 2);

      expect(db.Cart.findOrCreate).toHaveBeenCalled();
      expect(result.quantity).toBe(2);
    });

    it('should increment quantity if cart item exists', async () => {
      const mockCartItem = { quantity: 2, save: jest.fn().mockResolvedValue(true) };
      (db.Cart.findOrCreate as jest.Mock).mockResolvedValue([mockCartItem, false]);

      const result = await addToCart(1, 101, 3);

      expect(mockCartItem.quantity).toBe(5);
      expect(mockCartItem.save).toHaveBeenCalled();
    });
  });

  describe('getCart', () => {
    it('should return all cart items for a user', async () => {
      const mockItems = [{ id: 1, productId: 101 }];
      (db.Cart.findAll as jest.Mock).mockResolvedValue(mockItems);

      const result = await getCart(1);

      expect(db.Cart.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1 } }));
      expect(result).toEqual(mockItems);
    });
  });

  describe('placeOrderWithWallet', () => {
    it('should place order successfully and debit wallet', async () => {
      const mockProduct = { id: 101, basePrice: 100, discountPercentage: 10, stockQuantity: 10, save: jest.fn() };
      const mockUser = { id: 1, walletBalance: 200 };
      const mockOrder = { id: 501 };

      (db.Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);
      (db.User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (db.Order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await placeOrderWithWallet(1, 101, 1, 'Test Address');

      expect(mockProduct.stockQuantity).toBe(9);
      expect(walletService.debitWallet).toHaveBeenCalledWith(1, 90, 501, expect.any(String));
      expect(db.Cart.destroy).toHaveBeenCalled();
      expect(result).toBe(mockOrder);
    });

    it('should throw error if insufficient stock', async () => {
      (db.Product.findByPk as jest.Mock).mockResolvedValue({ stockQuantity: 1 });

      await expect(placeOrderWithWallet(1, 101, 2, 'Address'))
        .rejects.toThrow('Insufficient stock');
    });

    it('should throw error if insufficient wallet balance', async () => {
      (db.Product.findByPk as jest.Mock).mockResolvedValue({ basePrice: 100, stockQuantity: 10 });
      (db.User.findByPk as jest.Mock).mockResolvedValue({ walletBalance: 50 });

      await expect(placeOrderWithWallet(1, 101, 1, 'Address'))
        .rejects.toThrow('Insufficient wallet balance');
    });
  });
});
