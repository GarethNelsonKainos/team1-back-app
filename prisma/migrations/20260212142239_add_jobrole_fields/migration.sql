-- AlterTable
ALTER TABLE "JobRole" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "numberOfOpenPositions" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "responsibilities" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sharepointUrl" TEXT NOT NULL DEFAULT '';
