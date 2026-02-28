import { Router } from 'express';
import { getOrdenes, createOrden, getOrdenById, deleteOrden } from '../controllers/ordenController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize(['OWNER', 'ADMIN', 'VENDEDOR']), getOrdenes);

router.post('/', authenticate, authorize(['OWNER', 'VENDEDOR']), createOrden);

router.get('/:id', authenticate, authorize(['OWNER', 'ADMIN', 'VENDEDOR']), getOrdenById);

router.delete('/:id', authenticate, authorize(['OWNER', 'ADMIN']), deleteOrden);

export default router;
