import type { User } from './User.js';

interface UserType {
  userTypeId: number;
  userTypeDesc: string;
  users?: User[];
}

export type { UserType };
