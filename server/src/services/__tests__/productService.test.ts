import { getAllProducts, getProductById, deleteProduct } from '../productService';
import db from '../../models';
import { Request, Response } from 'express';

jest.mock('../../models', () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  Review: {},
  User: {},
}));

describe('ProductService', () => {
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

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [{ id: 1, name: 'Bat' }];
      (db.Product.findAll as jest.Mock).mockResolvedValue(mockProducts);

      await getAllProducts(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(db.Product.findAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ products: mockProducts });
    });
  });

  describe('getProductById', () => {
    it('should return a product if found', async () => {
      mockRequest = { params: { id: '1' } };
      const mockProduct = { id: 1, name: 'Bat' };
      (db.Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      await getProductById(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(db.Product.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockResponse.json).toHaveBeenCalledWith({ product: mockProduct });
    });

    it('should return 404 if product not found', async () => {
      mockRequest = { params: { id: '1' } };
      (db.Product.findByPk as jest.Mock).mockResolvedValue(null);

      await getProductById(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product and return success message', async () => {
      mockRequest = { params: { id: '1' } };
      (db.Product.destroy as jest.Mock).mockResolvedValue(1);

      await deleteProduct(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(db.Product.destroy).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product deleted successfully' });
    });

    it('should return 404 if product to delete not found', async () => {
      mockRequest = { params: { id: '1' } };
      (db.Product.destroy as jest.Mock).mockResolvedValue(0);

      await deleteProduct(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });
});
