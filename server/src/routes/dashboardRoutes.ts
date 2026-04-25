import { Router } from 'express';
import { getDashboardStats } from '../services/dashboardService';

const router: Router = Router();
console.log("Dashboard Controller Loaded");

router.get('/health', (req, res) => res.json({ status: "ok" }));

router.get('/stats', getDashboardStats);

export default router;
