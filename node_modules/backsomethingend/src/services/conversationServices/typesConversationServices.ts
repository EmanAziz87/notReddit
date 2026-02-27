import type { Prisma } from "../../../generated/prisma/client";

export type ConversationWithRelations = Prisma.ConversationsGetPayload<{
  include: {
    messages: {
      include: {
        sender: { select: { id: true; username: true; admin: true } };
      };
    };
  };
}>;
