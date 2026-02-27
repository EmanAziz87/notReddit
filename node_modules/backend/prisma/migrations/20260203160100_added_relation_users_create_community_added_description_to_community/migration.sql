/*
  Warnings:

  - Added the required column `creatorId` to the `Communities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Communities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Communities" ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Communities" ADD CONSTRAINT "Communities_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
