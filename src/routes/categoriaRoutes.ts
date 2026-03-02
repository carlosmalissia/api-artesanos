import { Router } from 'express';
import {
  obtenerCategoriasPublicas,
  obtenerCategoriasAdmin,
  obtenerCategoriasArbol,
  crearCategoria,
  actualizarCategoria,
  toggleCategoria,
} from '../controllers/categoriaController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// 🔓 Público (solo activas)
router.get('/public', obtenerCategoriasPublicas);

// 🔐 Admin (todas)
router.get('/admin', authenticate, authorize(['OWNER', 'ADMIN']), obtenerCategoriasAdmin);

router.get('/arbol/', obtenerCategoriasArbol);
router.post('/', authenticate, authorize(['OWNER', 'ADMIN']), crearCategoria);
/* router.get('/:id', getCategoriaById);  ver si hace falta*/
router.put('/:id', authenticate, authorize(['OWNER', 'ADMIN']), actualizarCategoria);
router.patch('/:id/toggle', authenticate, authorize(['OWNER', 'ADMIN']), toggleCategoria);

export default router;
