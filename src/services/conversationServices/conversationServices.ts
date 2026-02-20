import type { Conversations } from "../../../generated/prisma/client";
import prisma from "../../lib/prisma";
import {
  conversationExistsOrThrow,
  memberOfConversationOrThrow,
  userExistsOrThrow,
} from "../../lib/prismaHelpers";
import type { ConversationWithRelations } from "./typesConversationServices";

const createConversationService = async (
  receiverId: number,
  userId: number,
): Promise<Conversations> => {
  const receiver = await userExistsOrThrow(receiverId);
  return prisma.$transaction(async (tx) => {
    const createdConversation = await tx.conversations.create({});

    await tx.conversationParticipant.createMany({
      data: [
        {
          userId: userId,
          conversationId: createdConversation.id,
        },
        {
          userId: receiver.id,
          conversationId: createdConversation.id,
        },
      ],
    });

    return createdConversation;
  });
};

const getConversationHistoryService = async (
  conversationId: number,
  userId: number,
): Promise<ConversationWithRelations> => {
  const foundConversation = await conversationExistsOrThrow(conversationId);
  await memberOfConversationOrThrow(foundConversation.id, userId);

  return prisma.conversations.findUnique({
    where: {
      id: foundConversation.id,
    },
    include: {
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              admin: true,
            },
          },
        },
      },
    },
  }) as Promise<ConversationWithRelations>;
};

const getAllConversationsMetadataService = async (userId: number) => {
  return prisma.conversationParticipant.findMany({
    where: {
      userId: userId,
    },
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: {
              timestamp: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });
};

export default {
  createConversationService,
  getConversationHistoryService,
  getAllConversationsMetadataService,
};
