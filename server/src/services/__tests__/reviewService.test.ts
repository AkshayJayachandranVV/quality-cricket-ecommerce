import { createReview, getReviewsByProduct } from '../reviewService';
import db from '../../models';
import { Response } from 'express';

jest.mock('../../models', () => ({
  Review: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  User: {},
}));

describe('ReviewService', () => {
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

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      mockRequest.body = { productId: 101, rating: 5, comment: 'Great!' };
      (db.Review.create as jest.Mock).mockResolvedValue({ id: 1 });

      await createReview(mockRequest, mockResponse as Response, nextFunction);

      expect(db.Review.create).toHaveBeenCalledWith(expect.objectContaining({
        productId: 101,
        rating: 5,
        comment: 'Great!',
        userId: 1
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getReviewsByProduct', () => {
    it('should return all reviews for a product', async () => {
      mockRequest.params.productId = '101';
      const mockReviews = [{ id: 1, comment: 'Good' }];
      (db.Review.findAll as jest.Mock).mockResolvedValue(mockReviews);

      await getReviewsByProduct(mockRequest, mockResponse as Response, nextFunction);

      expect(db.Review.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { productId: 101 }
      }));
      expect(mockResponse.json).toHaveBeenCalledWith({ reviews: mockReviews });
    });
  });
});
