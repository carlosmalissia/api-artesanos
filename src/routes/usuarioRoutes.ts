import { Router } from 'express';
import {
  getUsuarios,
  createUsuario,
  getUsuarioById,
  updateUsuario,
  deleteUsuario
} from '../controllers/usuarioController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize(['admin']), getUsuarios);
router.post('/', createUsuario);
router.get('/:id', authenticate, getUsuarioById);
router.put('/:id', authenticate, authorize(['admin', 'vendedor']), updateUsuario);
router.delete('/:id', authenticate, authorize(['admin']), deleteUsuario);

export default router;
