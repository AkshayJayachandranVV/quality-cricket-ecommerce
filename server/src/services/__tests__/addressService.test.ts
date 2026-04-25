import { addAddress, getMyAddresses, deleteAddress } from '../addressService';
import db from '../../models';
import { Response } from 'express';

jest.mock('../../models', () => ({
  Address: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('AddressService', () => {
  let mockRequest: any;
  let mockResponse: Partial<Response>;
  let nextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = { userId: 1, body: {}, params: {} };
  });

  describe('getMyAddresses', () => {
    it('should return all addresses for a user', async () => {
      const mockAddresses = [{ id: 1, fullName: 'Akshay' }];
      (db.Address.findAll as jest.Mock).mockResolvedValue(mockAddresses);

      await getMyAddresses(mockRequest, mockResponse as Response, nextFunction);

      expect(db.Address.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1 } }));
      expect(mockResponse.json).toHaveBeenCalledWith({ addresses: mockAddresses });
    });
  });

  describe('addAddress', () => {
    it('should add a new address successfully', async () => {
      mockRequest.body = { fullName: 'Akshay', isDefault: true };
      (db.Address.create as jest.Mock).mockResolvedValue({ id: 1 });

      await addAddress(mockRequest, mockResponse as Response, nextFunction);

      expect(db.Address.update).toHaveBeenCalledWith({ isDefault: false }, { where: { userId: 1 } });
      expect(db.Address.create).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Akshay', userId: 1 }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('deleteAddress', () => {
    it('should delete address if found', async () => {
      mockRequest.params.id = '1';
      (db.Address.destroy as jest.Mock).mockResolvedValue(1);

      await deleteAddress(mockRequest, mockResponse as Response, nextFunction);

      expect(db.Address.destroy).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Address deleted successfully' });
    });

    it('should return 404 if address not found during delete', async () => {
      mockRequest.params.id = '1';
      (db.Address.destroy as jest.Mock).mockResolvedValue(0);

      await deleteAddress(mockRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
