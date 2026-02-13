/*
  Warnings:

  - You are about to drop the column `description` on the `JobRole` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfOpenPositions` on the `JobRole` table. All the data in the column will be lost.
  - You are about to drop the column `responsibilities` on the `JobRole` table. All the data in the column will be lost.
  - You are about to drop the column `sharepointUrl` on the `JobRole` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "description",
DROP COLUMN "numberOfOpenPositions",
DROP COLUMN "responsibilities",
DROP COLUMN "sharepointUrl";
