import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import uploads from "../../middleware/s3storage";
import {
  CreatePost,
  EditPost,
  PostParamsData,
  type CreatePostInput,
  type EditPostInput,
  type MulterS3File,
  type PostParams,
} from "./postSchema";
import postServices from "../../services/postServices/postServices";
import { cleanUpOrphanedImages } from "../../lib/s3cleanup";
const postRouter = express.Router();

postRouter.post(
  "/community/:communityId/create",
  isAuthenticated,
  uploads.array("postImages", 10),
  async (req, res, next) => {
    const files = req.files as MulterS3File[];
    const uploadedImageKeys = files.map((file) => file.key);
    try {
      const validatedData: CreatePostInput = CreatePost.parse(req.body);
      const validatedParams: PostParams = PostParamsData.parse(req.params);

      const createdPost = await postServices.createPostService(
        validatedData,
        validatedParams.communityId,
        req.session.userId!,
        files ? files.map((file) => file.location) : null,
      );

      res.status(201).json({
        status: "SUCCESS",
        message: "Post successfully created",
        createdPost,
      });
    } catch (err) {
      await cleanUpOrphanedImages(uploadedImageKeys);
      next(err);
    }
  },
);

postRouter.get(
  "/community/:communityId/post/:postId",
  async (req, res, next) => {
    try {
      const validatedParams: PostParams = PostParamsData.parse(req.params);
      const fetchedPost = await postServices.getPostService(
        validatedParams.communityId,
        validatedParams.postId!,
      );

      res.status(200).json({
        status: "SUCCESS",
        message: `Successfully grabbed post: ${fetchedPost.title}`,
        fetchedPost,
      });
    } catch (err) {
      next(err);
    }
  },
);

postRouter.get(
  "/community/followed",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const allFetchedPostsFromFollowed =
        await postServices.getAllPostsFollowedService(req.session.user!);

      res.status(200).json({
        status: "SUCCESS",
        message: "Successfully grabbed all posts from all followed communities",
        allFetchedPostsFromFollowed,
      });
    } catch (err) {
      next(err);
    }
  },
);

postRouter.get("/community/:communityId", async (req, res, next) => {
  try {
    const validatedParams: PostParams = PostParamsData.parse(req.params);
    const [allFetchedPosts, communityName] =
      await postServices.getAllPostsService(validatedParams.communityId);

    res.status(200).json({
      status: "SUCCESS",
      message: `Successfully grabbed all posts from community: ${communityName}`,
      allFetchedPosts,
    });
  } catch (err) {
    next(err);
  }
});

postRouter.put(
  "/community/:communityId/post/:postId",
  async (req, res, next) => {
    try {
      const validatedData: EditPostInput = EditPost.parse(req.body);
      const validatedParams: PostParams = PostParamsData.parse(req.params);

      res.status(201).json({ status: "SUCCESS", message: "" });
    } catch (err) {
      next(err);
    }
  },
);

export default postRouter;
