import type { PrismaClient } from '@prisma/client';
import AuthenticationError from '../errors/AuthenticationError.js';
import type {
  LoginRequest,
  LoginResponse,
  UserRole,
} from '../types/auth.types.js';
import { generateToken } from '../utils/jwt.utils.js';
import { comparePassword } from '../utils/password.utils.js';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new AuthenticationError('Email and password are required');
    }

    const sanitizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { userEmail: sanitizedEmail },
      include: { userType: true },
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const passwordMatch = await comparePassword(password, user.userPassword);

    if (!passwordMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    const token = generateToken({
      userId: user.userId,
      email: user.userEmail,
      userRole: user.userTypeId as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return { token: token };
  }
}
