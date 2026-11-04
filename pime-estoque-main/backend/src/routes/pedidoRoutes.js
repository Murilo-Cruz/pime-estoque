import { Router } from 'express';
import { atualizar, cancelar, criar, finalizar, listar, obter } from '../controllers/pedidoController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();
router.use(autenticar);

router.get('/', listar);
router.get('/:id', obter);
router.post('/', criar);
router.put('/:id', atualizar);
router.post('/:id/finalizar', finalizar);
router.post('/:id/cancelar', cancelar);

export default router;
