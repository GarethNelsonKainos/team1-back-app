import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/services/AuthService.js';
import * as jwtUtils from '../src/utils/jwt.utils';
import * as passwordUtils from '../src/utils/password.utils';

// Mock the utilities
vi.mock('../src/utils/jwt.utils');
vi.mock('../src/utils/password.utils');

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
    };

    authService = new AuthService(mockPrisma as unknown as PrismaClient);

    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedPassword123',
        userTypeId: 2,
        firstName: 'John',
        lastName: 'Doe',
        userType: { userTypeId: 2, userTypeName: 'Candidate' },
      };

      const mockToken = 'mock.jwt.token';

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateToken).mockReturnValue(mockToken);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ token: mockToken });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userEmail: 'test@example.com' },
        include: { userType: true },
      });
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({
        userId: 1,
        email: 'test@example.com',
        userRole: 2,
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should throw AuthenticationError when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrowError('Invalid credentials');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userEmail: 'nonexistent@example.com' },
        include: { userType: true },
      });
      expect(passwordUtils.comparePassword).not.toHaveBeenCalled();
      expect(jwtUtils.generateToken).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError when password does not match', async () => {
      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedPassword123',
        userTypeId: 2,
        firstName: 'John',
        lastName: 'Doe',
        userType: { userTypeId: 2, userTypeName: 'Candidate' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrowError('Invalid credentials');

      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword123',
      );
      expect(jwtUtils.generateToken).not.toHaveBeenCalled();
    });

    it('should sanitize email by trimming whitespace', async () => {
      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedPassword123',
        userTypeId: 2,
        firstName: 'John',
        lastName: 'Doe',
        userType: { userTypeId: 2, userTypeName: 'Candidate' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateToken).mockReturnValue('mock.token');

      await authService.login({
        email: '  test@example.com  ',
        password: 'password123',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userEmail: 'test@example.com' },
        include: { userType: true },
      });
    });

    it('should sanitize email by converting to lowercase', async () => {
      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedPassword123',
        userTypeId: 2,
        firstName: 'John',
        lastName: 'Doe',
        userType: { userTypeId: 2, userTypeName: 'Candidate' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateToken).mockReturnValue('mock.token');

      await authService.login({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userEmail: 'test@example.com' },
        include: { userType: true },
      });
    });

    it('should sanitize email by trimming and lowercasing together', async () => {
      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedPassword123',
        userTypeId: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        userType: { userTypeId: 2, userTypeName: 'Candidate' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateToken).mockReturnValue('mock.token');

      await authService.login({
        email: '  TeSt@ExAmPlE.cOm  ',
        password: 'password123',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userEmail: 'test@example.com' },
        include: { userType: true },
      });
    });

    it('should include userType in the query', async () => {
      const mockUser = {
        userId: 1,
        userEmail: 'test@example.com',
        userPassword: 'hashedPassword123',
        userTypeId: 3,
        firstName: 'Admin',
        lastName: 'User',
        userType: { userTypeId: 3, userTypeName: 'Admin' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateToken).mockReturnValue('admin.token');

      await authService.login({
        email: 'admin@example.com',
        password: 'adminPass',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userEmail: 'admin@example.com' },
        include: { userType: true },
      });
    });

    it('should pass correct user data to token generation', async () => {
      const mockUser = {
        userId: 42,
        userEmail: 'specific@example.com',
        userPassword: 'hashedPassword',
        userTypeId: 5,
        firstName: 'Alice',
        lastName: 'Wonder',
        userType: { userTypeId: 5, userTypeName: 'Manager' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateToken).mockReturnValue('specific.token');

      await authService.login({
        email: 'specific@example.com',
        password: 'correctPassword',
      });

      expect(jwtUtils.generateToken).toHaveBeenCalledWith({
        userId: 42,
        email: 'specific@example.com',
        userRole: 5,
        firstName: 'Alice',
        lastName: 'Wonder',
      });
    });
  });
});
