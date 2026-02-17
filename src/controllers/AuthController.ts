import type { Request, Response } from 'express';
import AuthenticationError from '../errors/AuthenticationError.js';
import type { AuthService } from '../services/AuthService.js';
import type { LoginRequest } from '../types/auth.types.js';
import { validateLoginRequest } from '../validator/LoginValidator.js';

export default class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginRequest = req.body as LoginRequest;
      const validationResult = validateLoginRequest(loginRequest);
      if (!validationResult) {
        res.status(400).json({ error: 'Invalid credentials' });
        return;
      }

      const result = await this.authService.login(loginRequest);
      if (!result) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      res.json({ token: result.token });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        console.log('Authentication error:', error.message);
        res.status(401).json({ error: error.message });
        return;
      }

      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
