// This file defines what data looks like

import type { UserRole } from './user-role.js';
export { UserRole } from './user-role.js';

export interface JWTPayload {
  userId: number;
  email: string;
  userRole: UserRole;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string | undefined;
  password: string | undefined;
}

export interface LoginResponse {
  token: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user: JWTPayload;
    }
  }
}
