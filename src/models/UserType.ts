import type { User } from './User';

interface UserType {
  userTypeId: number;
  userTypeDesc: string;
  users?: User[];
}

export type { UserType };
