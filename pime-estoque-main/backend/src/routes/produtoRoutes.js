import { Router } from 'express';
import { alterarStatus, atualizar, criar, excluir, listar, obter } from '../controllers/produtoController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();
router.use(autenticar);

router.get('/', listar);
router.get('/:id', obter);
router.post('/', criar);
router.put('/:id', atualizar);
router.patch('/:id/status', alterarStatus);
router.delete('/:id', excluir);

export default router;
