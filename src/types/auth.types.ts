// This file defines what data looks like

export interface JWTPayload {
  userId: number;
  email: string;
  userTypeId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
