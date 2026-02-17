import type { Application } from './Application.js';

interface ApplicationStatus {
  applicationStatusId: number;
  applicationStatusType: string;
  applications?: Application[];
}

export type { ApplicationStatus };
