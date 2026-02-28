import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getExecutiveStats, getSalesByMonth } from '../controllers/executiveControler';

const router = Router();

router.get('/stats', authenticate, authorize(['OWNER']), getExecutiveStats);
router.get('/sales-by-month', authenticate, authorize(['OWNER']), getSalesByMonth);

export default router;
