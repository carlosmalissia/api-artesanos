import { Router } from 'express';
import { getClientes } from "../controllers/clientes.controllers";

import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get("/", authenticate, authorize (["admin", "vendedor"]), getClientes);

export default router;