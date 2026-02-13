import type { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.utils';
import { comparePassword } from '../utils/password.utils';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(credentials: LoginCredentials): Promise<LoginResult | null> {
    const { email, password } = credentials;

    // Sanitize email (trim whitespace, lowercase)
    const sanitizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { userEmail: sanitizedEmail },
      include: { userType: true },
    });

    if (!user) {
      return null;
    }

    // Compare passwords
    const passwordMatch = await comparePassword(password, user.userPassword);

    if (!passwordMatch) {
      return null;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      email: user.userEmail,
      userTypeId: user.userTypeId,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return { token };
  }
}
