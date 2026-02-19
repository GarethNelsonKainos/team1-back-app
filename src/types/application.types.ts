export interface CreateApplicationRequest {
  jobRoleId: number;
  userId: number;
  cvFile: Express.Multer.File;
}

export interface Application {
  applicationId: number;
  jobRoleId: number;
  userId: number;
  applicationStatusId: number;
  cvUrl?: string | null;
  createdAt: Date;
}

export enum JobRoleStatus {
  Open = 'Open',
  Closed = 'Closed',
}
