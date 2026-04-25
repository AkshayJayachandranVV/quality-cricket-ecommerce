import { register, login, forgotPasswordRequest, resetPassword } from '../authService';
import db from '../../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../utils/SmsSender', () => ({
  sendOtp: jest.fn(),
}));

jest.mock('../emailService', () => ({
  sendForgotPasswordOtp: jest.fn(),
}));

describe('AuthService', () => {
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

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockRequest = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '1234567890',
          password: 'password123',
        },
      };

      (db.User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (db.User.create as jest.Mock).mockResolvedValue({ id: 1 });

      await register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(db.User.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(db.User.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'john@example.com',
        role: 'Customer',
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Registration successful',
      }));
    });

    it('should return 400 if email is already registered', async () => {
      mockRequest = { body: { email: 'john@example.com' } };
      (db.User.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      await register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email already registered' });
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      mockRequest = {
        body: { email: 'john@example.com', password: 'password123' },
      };
      const mockUser = {
        id: 1,
        firstName: 'John',
        passwordHash: 'hashed_password',
        role: 'Customer',
        isBlocked: false,
      };

      (db.User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      await login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Login successful',
        token: 'mock_token',
      }));
    });

    it('should return 401 for incorrect password', async () => {
      mockRequest = { body: { email: 'john@example.com', password: 'wrong' } };
      (db.User.findOne as jest.Mock).mockResolvedValue({ passwordHash: 'hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });
});
