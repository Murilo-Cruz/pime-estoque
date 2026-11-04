import { Router } from 'express';
import { obter } from '../controllers/financeiroController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();
router.use(autenticar);

router.get('/', obter);

export default router;
