import { Router } from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../services/productService';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router: Router = Router();

// Public Product Routes
router.get('/', getAllProducts);           // GET /api/products
router.get('/top-sellers', getAllProducts); // GET /api/products/top-sellers (for now same as all, will limit in service)
router.get('/:id', getProductById);       // GET /api/products/:id

// Admin-Protected Product Routes
router.post('/', verifyToken, isAdmin, upload.array('images', 4), createProduct);          // POST /api/products
router.put('/:id', verifyToken, isAdmin, upload.array('images', 4), updateProduct);        // PUT /api/products/:id
router.delete('/:id', verifyToken, isAdmin, deleteProduct);     // DELETE /api/products/:id

export default router;
