-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Grade" ADD VALUE 'G4';
ALTER TYPE "Grade" ADD VALUE 'G5';
ALTER TYPE "Grade" ADD VALUE 'G6';
ALTER TYPE "Grade" ADD VALUE 'G7';
ALTER TYPE "Grade" ADD VALUE 'G8';
ALTER TYPE "Grade" ADD VALUE 'G9';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';
