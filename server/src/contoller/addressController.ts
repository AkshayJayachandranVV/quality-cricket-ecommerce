import { Router } from 'express';
import { getMyAddresses, addAddress, updateAddress, deleteAddress } from '../services/addressService';
import { verifyToken } from '../middleware/authMiddleware';

const router: Router = Router();

router.use(verifyToken);

router.get('/', getMyAddresses);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
