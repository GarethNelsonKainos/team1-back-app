import type { Application } from './Application';
import type { UserType } from './UserType';

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
