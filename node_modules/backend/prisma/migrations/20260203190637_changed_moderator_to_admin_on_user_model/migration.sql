/*
  Warnings:

  - You are about to drop the column `moderator` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "moderator",
ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;
