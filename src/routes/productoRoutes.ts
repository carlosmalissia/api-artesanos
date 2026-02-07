import { Router } from 'express';
import {
  getProductos,
  createProducto,
  getProductoById,
  updateProducto,
  deleteProducto
} from '../controllers/productoController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', getProductos);
router.post('/', authenticate, authorize(['admin', 'vendedor']), createProducto);
router.get('/:id', getProductoById);
router.put('/:id', authenticate, authorize(['admin', 'vendedor']), updateProducto);
router.delete('/:id', authenticate, authorize(['admin', 'vendedor']), deleteProducto);

export default router;
