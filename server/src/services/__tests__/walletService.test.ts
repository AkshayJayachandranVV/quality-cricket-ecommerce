import { creditWallet, debitWallet } from '../walletService';
import db from '../../models';

jest.mock('../../models', () => ({
  User: {
    findByPk: jest.fn(),
  },
  WalletTransaction: {
    create: jest.fn(),
  },
}));

describe('WalletService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('creditWallet', () => {
    it('should correctly credit the wallet and create a transaction', async () => {
      const mockUser = {
        walletBalance: 100,
        update: jest.fn().mockResolvedValue(true),
      };
      (db.User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await creditWallet(1, 50, 101, 'Test Credit');

      expect(db.User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith({ walletBalance: 150 });
      expect(db.WalletTransaction.create).toHaveBeenCalledWith({
        userId: 1,
        orderId: 101,
        amount: 50,
        type: 'Credit',
        description: 'Test Credit',
      });
    });

    it('should throw error if user not found', async () => {
      (db.User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(creditWallet(1, 50, undefined, 'Test'))
        .rejects.toThrow('User not found');
    });
  });

  describe('debitWallet', () => {
    it('should correctly debit the wallet and create a transaction', async () => {
      const mockUser = {
        walletBalance: 100,
        update: jest.fn().mockResolvedValue(true),
      };
      (db.User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await debitWallet(1, 40, 102, 'Test Debit');

      expect(mockUser.update).toHaveBeenCalledWith({ walletBalance: 60 });
      expect(db.WalletTransaction.create).toHaveBeenCalledWith({
        userId: 1,
        orderId: 102,
        amount: 40,
        type: 'Debit',
        description: 'Test Debit',
      });
    });

    it('should throw error if balance is insufficient', async () => {
      const mockUser = {
        walletBalance: 30,
        update: jest.fn(),
      };
      (db.User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await expect(debitWallet(1, 50, undefined, 'Test'))
        .rejects.toThrow('Insufficient wallet balance');
      
      expect(mockUser.update).not.toHaveBeenCalled();
    });
  });
});
