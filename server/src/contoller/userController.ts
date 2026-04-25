import { Router } from 'express';
import { 
    getAllUsers, 
    updateUser, 
    deleteUser 
} from '../services/userService';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';

const router: Router = Router();

// All routes here are admin only
router.use(verifyToken, isAdmin);

router.get('/', getAllUsers);           // GET /api/users
router.put('/:id', updateUser);        // PUT /api/users/:id
router.delete('/:id', deleteUser);     // DELETE /api/users/:id

export default router;
