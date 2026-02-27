/*
  Warnings:

  - You are about to drop the `_ConversationsToUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ConversationsToUsers" DROP CONSTRAINT "_ConversationsToUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationsToUsers" DROP CONSTRAINT "_ConversationsToUsers_B_fkey";

-- AlterTable
ALTER TABLE "Conversations" ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Messages" ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_ConversationsToUsers";

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
