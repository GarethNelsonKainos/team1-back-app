import type { LoginRequest } from '../types/auth.types.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginRequest(request: LoginRequest): boolean {
  if (!request.email || !request.password) {
    return false;
  }

  if (!EMAIL_REGEX.test(request.email)) {
    return false;
  }

  if (request.email.length > 255 || request.password.length > 128) {
    return false;
  }

  if (request.password.length < 8) {
    return false;
  }

  return true;
}
