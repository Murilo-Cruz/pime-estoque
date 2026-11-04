import { Router } from 'express';
import { criar, listar, obter } from '../controllers/entradaController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();
router.use(autenticar);

router.get('/', listar);
router.get('/:id', obter);
router.post('/', criar);

export default router;
