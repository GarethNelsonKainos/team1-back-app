// This file defines what data looks like

export enum UserRole {
  Applicant = 1,
  Admin = 2,
}

export interface JWTPayload {
  userId: number;
  email: string;
  userTypeId: UserRole;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
