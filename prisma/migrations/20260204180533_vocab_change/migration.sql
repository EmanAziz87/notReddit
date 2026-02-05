/*
  Warnings:

  - You are about to drop the column `followerCount` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "followerCount",
ADD COLUMN     "followingCount" INTEGER NOT NULL DEFAULT 0;
