import { Router } from 'express';
import {
  getCategorias,
  createCategoria,
  getCategoriaById,
  updateCategoria,
  deleteCategoria
} from '../controllers/categoriaController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', getCategorias);
router.post('/', authenticate, authorize(['admin', 'vendedor']), createCategoria);
router.get('/:id', getCategoriaById);
router.put('/:id', authenticate, authorize(['admin', 'vendedor']), updateCategoria);
router.delete('/:id', authenticate, authorize(['admin']), deleteCategoria);

export default router;
