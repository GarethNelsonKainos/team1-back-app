import type { Application } from './Application';

interface ApplicationStatus {
  applicationStatusId: number;
  applicationStatusType: string;
  applications?: Application[];
}

export type { ApplicationStatus };
