import { Router } from 'express';
import { getClientes } from '../controllers/clientesControllers';

import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize(['OWNER', 'ADMIN', 'VENDEDOR']), getClientes);

export default router;
