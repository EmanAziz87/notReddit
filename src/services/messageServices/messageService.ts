import prisma from "../../lib/prisma";
import {
  conversationExistsOrThrow,
  memberOfConversationOrThrow,
} from "../../lib/prismaHelpers";

const createMessageService = async (
  conversationId: number,
  userId: number,
  content: string,
) => {
  const foundConversation = await conversationExistsOrThrow(conversationId);
  await memberOfConversationOrThrow(foundConversation.id, userId);

  return prisma.messages.create({
    data: {
      message: content,
      senderId: userId,
      conversationId: foundConversation.id,
    },
  });
};

export default { createMessageService };
