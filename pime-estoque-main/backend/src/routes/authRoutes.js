import { Router } from 'express';
import { registrar, login, me } from '../controllers/authController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.post('/register', registrar);
router.post('/login', login);
router.get('/me', autenticar, me);

export default router;