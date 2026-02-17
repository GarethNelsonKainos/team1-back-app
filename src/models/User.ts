import type { Application } from './Application.js';
import type { UserType } from './UserType.js';

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  userTypeId: number;
  userType?: UserType;
  applications?: Application[];
}

export type { User };
