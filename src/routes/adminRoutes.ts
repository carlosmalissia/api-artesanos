import { Router } from 'express';
import { getVendorsWithMetrics } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize(['admin']), getVendorsWithMetrics);

export default router;
