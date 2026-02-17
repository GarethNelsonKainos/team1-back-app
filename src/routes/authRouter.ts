import { Router } from 'express';
import type AuthController from '../controllers/AuthController.js';

export default function authRouter(authController: AuthController): Router {
  const router = Router();

  router.post('/login', (req, res) => authController.login(req, res));

  return router;
}
