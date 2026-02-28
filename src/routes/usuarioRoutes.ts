import { Router } from 'express';
import {
  getUsuarios,
  createUsuario,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
} from '../controllers/usuarioController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

const ADMIN_ROLES = ['OWNER', 'ADMIN'];
const EDIT_ROLES = ['OWNER', 'ADMIN', 'VENDEDOR'];

router.get('/', authenticate, authorize(ADMIN_ROLES), getUsuarios);

router.post('/', createUsuario);

router.get('/:id', authenticate, getUsuarioById);

router.put('/:id', authenticate, authorize(EDIT_ROLES), updateUsuario);

router.delete('/:id', authenticate, authorize(ADMIN_ROLES), deleteUsuario);

export default router;
