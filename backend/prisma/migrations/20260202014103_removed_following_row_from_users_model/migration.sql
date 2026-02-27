/*
  Warnings:

  - You are about to drop the column `following` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "following",
ALTER COLUMN "moderator" SET DEFAULT false;
