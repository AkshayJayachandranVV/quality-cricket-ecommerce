import { getAllUsers, updateUser, deleteUser } from '../userService';
import db from '../../models';
import { Request, Response } from 'express';

jest.mock('../../models', () => ({
  User: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('UserService', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getAllUsers', () => {
    it('should return all users excluding sensitive fields', async () => {
      const mockUsers = [{ id: 1, firstName: 'User' }];
      (db.User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      await getAllUsers(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(db.User.findAll).toHaveBeenCalledWith(expect.objectContaining({
        attributes: expect.objectContaining({ exclude: ['passwordHash', 'otp', 'otpExpiry'] })
      }));
      expect(mockResponse.json).toHaveBeenCalledWith({ users: mockUsers });
    });
  });

  describe('updateUser', () => {
    it('should update user if found', async () => {
      mockRequest = { params: { id: '1' }, body: { firstName: 'New' } };
      const mockUser = { update: jest.fn().mockResolvedValue(true) };
      (db.User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await updateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockUser.update).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'New' }));
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User updated successfully' }));
    });
  });

  describe('deleteUser', () => {
    it('should delete user if exists', async () => {
      mockRequest = { params: { id: '1' } };
      (db.User.destroy as jest.Mock).mockResolvedValue(1);

      await deleteUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(db.User.destroy).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });
  });
});
