import type {
  LoginCredentials,
  LoginResult,
} from '../services/auth.service.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginParseResult =
  | { ok: true; credentials: LoginCredentials }
  | { ok: false; error: string };

export function toLoginCredentials(body: unknown): LoginParseResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid credentials' };
  }

  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { ok: false, error: 'Invalid credentials' };
  }

  const sanitizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(sanitizedEmail)) {
    return { ok: false, error: 'Invalid credentials' };
  }

  if (sanitizedEmail.length > 255 || password.length > 128) {
    return { ok: false, error: 'Invalid credentials' };
  }

  if (password.length < 8) {
    return { ok: false, error: 'Invalid credentials' };
  }

  return { ok: true, credentials: { email: sanitizedEmail, password } };
}

export function toLoginResponse(result: LoginResult): LoginResult {
  return { token: result.token };
}
