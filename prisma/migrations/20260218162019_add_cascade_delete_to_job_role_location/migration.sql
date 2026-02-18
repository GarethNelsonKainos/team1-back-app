-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobRoleId_fkey";

-- DropForeignKey
ALTER TABLE "JobRoleLocation" DROP CONSTRAINT "JobRoleLocation_jobRoleId_fkey";

-- AddForeignKey
ALTER TABLE "JobRoleLocation" ADD CONSTRAINT "JobRoleLocation_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("jobRoleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("jobRoleId") ON DELETE CASCADE ON UPDATE CASCADE;
