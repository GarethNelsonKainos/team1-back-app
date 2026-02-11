/*
  Warnings:

  - A unique constraint covering the columns `[applicationStatusType]` on the table `ApplicationStatus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bandName]` on the table `Band` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[capabilityName]` on the table `Capability` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleName]` on the table `JobRole` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[statusName]` on the table `JobRoleStatus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[locationName]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userTypeDesc]` on the table `UserType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApplicationStatus_applicationStatusType_key" ON "ApplicationStatus"("applicationStatusType");

-- CreateIndex
CREATE UNIQUE INDEX "Band_bandName_key" ON "Band"("bandName");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_capabilityName_key" ON "Capability"("capabilityName");

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_roleName_key" ON "JobRole"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "JobRoleStatus_statusName_key" ON "JobRoleStatus"("statusName");

-- CreateIndex
CREATE UNIQUE INDEX "Location_locationName_key" ON "Location"("locationName");

-- CreateIndex
CREATE UNIQUE INDEX "UserType_userTypeDesc_key" ON "UserType"("userTypeDesc");
