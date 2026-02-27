import type { Communities } from "../../../generated/prisma/client";
import { ConflictError, ForbiddenContentError } from "../../lib/appErrors";
import prisma from "../../lib/prisma";
import { communityFoundOrThrow } from "../../lib/prismaHelpers";
import type {
  CreateCommunityInput,
  EditCommunityInput,
} from "../../routes/communityRoutes/communitySchema";
import type { FollowedCommunitiesWithCommunity } from "./typesCommunityServices";

const createCommunityService = async (
  communityInputData: CreateCommunityInput,
  userId: number,
): Promise<Communities> => {
  const userIdNumber = Number(userId);

  const foundCommunity = await prisma.communities.findFirst({
    where: {
      name: communityInputData.name,
    },
  });

  if (foundCommunity) {
    throw new ConflictError("That community already exists");
  }

  return prisma.communities.create({
    data: {
      name: communityInputData.name,
      description: communityInputData.description,
      public: communityInputData.public,
      creator: {
        connect: { id: userIdNumber },
      },
    },
  });
};

const editCommunityService = async (
  editedCommunityInputData: EditCommunityInput,
  communityId: number,
  userId: number,
): Promise<Communities> => {
  const userIdNumber = Number(userId);
  const foundCommunity = await communityFoundOrThrow(communityId);

  if (foundCommunity.creatorId !== userIdNumber) {
    throw new ForbiddenContentError(
      "A community can only be edited by the creator or an admin",
    );
  }

  return await prisma.communities.update({
    where: {
      id: foundCommunity.id,
    },
    data: {
      description: editedCommunityInputData.description,
      public: editedCommunityInputData.public,
    },
  });
};

const getCommunityService = async (
  communityId: number,
): Promise<Communities> => {
  const fetchedCommunity = await communityFoundOrThrow(communityId);

  return fetchedCommunity;
};

const getAllCommunitiesService = async (): Promise<Communities[]> => {
  return prisma.communities.findMany({});
};

const followCommunityService = async (
  communityId: number,
  userId: number,
): Promise<FollowedCommunitiesWithCommunity> => {
  const userIdNumber = Number(userId);

  await communityFoundOrThrow(communityId);

  const alreadyFollow = await prisma.followedCommunities.findFirst({
    where: {
      communityId: communityId,
      userId: userIdNumber,
    },
  });

  if (alreadyFollow) {
    throw new ConflictError("You already follow that community");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.followedCommunities.create({
      data: {
        communityId,
        userId: userIdNumber,
      },
    });

    await tx.communities.update({
      where: {
        id: communityId,
      },
      data: {
        followers: {
          increment: 1,
        },
      },
    });

    await tx.users.update({
      where: {
        id: userIdNumber,
      },
      data: {
        followingCount: {
          increment: 1,
        },
      },
    });

    return tx.followedCommunities.findFirstOrThrow({
      where: {
        communityId,
        userId: userIdNumber,
      },
      include: {
        community: true,
      },
    });
  });
};

const unfollowCommunityService = async (
  communityId: number,
  userId: number,
): Promise<Communities> => {
  const userIdNumber = Number(userId);
  await communityFoundOrThrow(communityId);

  const alreadyFollow = await prisma.followedCommunities.findFirst({
    where: {
      communityId: communityId,
      userId: userIdNumber,
    },
  });

  if (!alreadyFollow) {
    throw new ConflictError("You don't follow that community");
  }

  return prisma.$transaction(async (tx) => {
    await tx.followedCommunities.delete({
      where: {
        userId_communityId: {
          communityId: communityId,
          userId: userIdNumber,
        },
      },
    });

    await tx.users.update({
      where: {
        id: userIdNumber,
      },
      data: {
        followingCount: {
          decrement: 1,
        },
      },
    });

    return await tx.communities.update({
      where: {
        id: communityId,
      },
      data: {
        followers: {
          decrement: 1,
        },
      },
    });
  });
};

export default {
  createCommunityService,
  editCommunityService,
  getCommunityService,
  getAllCommunitiesService,
  followCommunityService,
  unfollowCommunityService,
};
