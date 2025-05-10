import { Router } from 'express';
import {
  getOrdenes,
  createOrden,
  getOrdenById,
  deleteOrden
} from '../controllers/ordenController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize(['admin', 'vendedor']), getOrdenes);
router.post('/', authenticate, createOrden);
router.get('/:id', authenticate, getOrdenById);
router.delete('/:id', authenticate, authorize(['admin']), deleteOrden);

export default router;
