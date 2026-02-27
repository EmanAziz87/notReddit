import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import {
  CommunityId,
  CreateCommunity,
  EditCommunity,
  type CommunityIdParams,
  type CreateCommunityInput,
  type EditCommunityInput,
} from "./communitySchema";
import communityServices from "../../services/communityServices/communityServices";
import { saveSession } from "../../lib/saveSession";

const communityRouter = express.Router();

communityRouter.post("/create", isAuthenticated, async (req, res, next) => {
  try {
    const validatedData: CreateCommunityInput = CreateCommunity.parse(req.body);
    const createdCommunity = await communityServices.createCommunityService(
      validatedData,
      req.session.userId,
    );

    res.status(201).json({
      status: "SUCCESS",
      message: `Successfully created ${createdCommunity.name}`,
      createdCommunity,
    });
  } catch (err) {
    next(err);
  }
});

communityRouter.put("/edit/:id", isAuthenticated, async (req, res, next) => {
  try {
    const validatedParams: CommunityIdParams = CommunityId.parse(req.params);
    const validatedData: EditCommunityInput = EditCommunity.parse(req.body);

    const editedCommunity = await communityServices.editCommunityService(
      validatedData,
      validatedParams.id,
      req.session.userId,
    );

    res.status(201).json({
      status: "SUCCESS",
      message: `Successfully edited ${editedCommunity.name}`,
      editedCommunity,
    });
  } catch (err) {
    next(err);
  }
});

communityRouter.get("/", async (_req, res, next) => {
  try {
    const fetchedCommunities =
      await communityServices.getAllCommunitiesService();

    res.status(200).json({
      status: 200,
      message: `Successfully grabbed all communitiese`,
      allCommunities: fetchedCommunities,
    });
  } catch (err) {
    console.error("DEBUG ERROR:", err);
    next(err);
  }
});

communityRouter.get("/:id", async (req, res, next) => {
  try {
    const validatedParams: CommunityIdParams = CommunityId.parse(req.params);

    const fetchedCommunity = await communityServices.getCommunityService(
      validatedParams.id,
    );

    res.status(200).json({
      status: "SUCCESS",
      message: `Sucessfully grabbed ${fetchedCommunity.name}`,
      fetchedCommunity,
    });
  } catch (err) {
    next(err);
  }
});

communityRouter.put("/follow/:id", isAuthenticated, async (req, res, next) => {
  try {
    const validatedParams: CommunityIdParams = CommunityId.parse(req.params);
    const followedCommunity = await communityServices.followCommunityService(
      validatedParams.id,
      req.session.userId,
    );

    req.session.user!.followingCount += 1;
    await saveSession(req);

    res.status(201).json({
      status: "SUCCESS",
      message: `Successfully followed ${followedCommunity.community.name}`,
      followedCommunity: followedCommunity.community,
    });
  } catch (err) {
    next(err);
  }
});

communityRouter.put(
  "/unfollow/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: CommunityIdParams = CommunityId.parse(req.params);
      const unfollowedCommunity =
        await communityServices.unfollowCommunityService(
          validatedParams.id,
          req.session.userId,
        );
      req.session.user!.followingCount -= 1;
      await saveSession(req);
      res.status(201).json({
        status: "SUCCESS",
        message: `Successfully unfollowed ${unfollowedCommunity.name}`,
        unfollowedCommunity: unfollowedCommunity,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default communityRouter;
