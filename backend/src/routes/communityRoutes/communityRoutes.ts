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
import uploads from "../../middleware/s3storage";
import { cleanUpOrphanedImages } from "../../lib/s3cleanup";

const communityRouter = express.Router();
const createCommunityFileFields = uploads.fields([
  { name: "communityProfileImage", maxCount: 1 },
  { name: "communityBannerImage", maxCount: 1 },
]);

communityRouter.post(
  "/create",
  isAuthenticated,
  createCommunityFileFields,
  async (req, res, next) => {
    const files = req.files as {
      [fieldName: string]: Express.MulterS3.File[];
    };
    const profileImageUrl = files["communityProfileImage"]?.[0]?.location;
    const bannerImageUrl = files["communityBannerImage"]?.[0]?.location;
    try {
      console.log("profileImageURl: ", profileImageUrl);
      console.log("bannerImageURl: ", bannerImageUrl);
      const validatedData: CreateCommunityInput = CreateCommunity.parse(
        req.body,
      );
      const createdCommunity = await communityServices.createCommunityService(
        validatedData,
        req.session.userId,
        bannerImageUrl,
        profileImageUrl,
      );

      res.status(201).json({
        status: "SUCCESS",
        message: `Successfully created ${createdCommunity.name}`,
        createdCommunity,
      });
    } catch (err) {
      await cleanUpOrphanedImages([profileImageUrl!, bannerImageUrl!]);
      next(err);
    }
  },
);

communityRouter.put(
  "/edit/:communityId",
  isAuthenticated,
  createCommunityFileFields,
  async (req, res, next) => {
    const files = req.files as {
      [fieldName: string]: Express.MulterS3.File[];
    };
    const profileImageUrl = files["communityProfileImage"]?.[0]?.location;
    const bannerImageUrl = files["communityBannerImage"]?.[0]?.location;
    try {
      const validatedParams: CommunityIdParams = CommunityId.parse(req.params);
      const validatedData: EditCommunityInput = EditCommunity.parse(req.body);

      const editedCommunity = await communityServices.editCommunityService(
        validatedData.description,
        validatedData.public,
        validatedParams.communityId,
        req.session.userId,
        bannerImageUrl,
        profileImageUrl,
      );

      res.status(201).json({
        status: "SUCCESS",
        message: `Successfully edited ${editedCommunity.name}`,
        editedCommunity,
      });
    } catch (err) {
      await cleanUpOrphanedImages([profileImageUrl!, bannerImageUrl!]);
      next(err);
    }
  },
);

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

communityRouter.get("/:communityId", async (req, res, next) => {
  try {
    const validatedParams: CommunityIdParams = CommunityId.parse(req.params);

    const fetchedCommunity = await communityServices.getCommunityService(
      validatedParams.communityId,
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
      validatedParams.communityId,
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
          validatedParams.communityId,
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
