import { getDashboardStats } from '../dashboardService';
import db from '../../models';
import { Request, Response } from 'express';

jest.mock('../../models', () => ({
  Order: {
    sum: jest.fn(),
    count: jest.fn(),
    findAll: jest.fn(),
  },
  User: {
    count: jest.fn(),
  },
  Product: {},
}));

describe('DashboardService', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getDashboardStats', () => {
    it('should aggregate all stats successfully', async () => {
      (db.Order.sum as jest.Mock).mockResolvedValueOnce(5000); // Total Earnings
      (db.Order.count as jest.Mock).mockResolvedValueOnce(100); // Total Sales
      (db.Order.count as jest.Mock).mockResolvedValueOnce(120); // Total Orders
      (db.User.count as jest.Mock).mockResolvedValue(80); // Total Customers
      (db.Order.sum as jest.Mock).mockResolvedValueOnce(500); // Today Sale
      (db.Order.findAll as jest.Mock).mockResolvedValueOnce([]); // Recent Orders
      (db.Order.findAll as jest.Mock).mockResolvedValueOnce([]); // Sales History

      await getDashboardStats(mockRequest as Request, mockResponse as Response);

      expect(db.Order.sum).toHaveBeenCalledTimes(2);
      expect(db.Order.count).toHaveBeenCalledTimes(2);
      expect(db.User.count).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        totalEarning: 5000,
        totalSales: 100,
        totalOrders: 120,
        totalCustomers: 80,
      }));
    });

    it('should handle errors and return 500', async () => {
      (db.Order.sum as jest.Mock).mockRejectedValue(new Error('DB Fail'));

      await getDashboardStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Server error',
      }));
    });
  });
});
