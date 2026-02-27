/*
  Warnings:

  - The primary key for the `ConversationParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ConversationParticipant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ConversationParticipant_conversationId_userId_key";

-- AlterTable
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("conversationId", "userId");
