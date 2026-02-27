import type { Prisma } from "../../../generated/prisma/client";

export type FollowedCommunitiesWithCommunity =
  Prisma.FollowedCommunitiesGetPayload<{ include: { community: true } }>;
