import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import uploads from "../../middleware/s3storage";
import {
  CreatePost,
  type CreatePostInput,
  type MulterS3File,
} from "./postSchema";
import postServices from "../../services/postServices/postServices";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  CommunityId,
  type CommunityIdParams,
} from "../communityRoutes/communitySchema";
const postRoutes = express.Router();

postRoutes.post(
  "/community/:communityId/create",
  isAuthenticated,
  uploads.array("postImages", 10),
  async (req, res, next) => {
    const files = req.files as MulterS3File[];
    const uploadedImageKeys = files.map((file) => file.key);
    try {
      const validatedData: CreatePostInput = CreatePost.parse(req.body);
      const validatedParams: CommunityIdParams = CommunityId.parse(req.params);

      const createdPost = await postServices.createPostService(
        validatedData,
        validatedParams.id,
        req.session.userId!,
        files.map((file) => file.location),
      );

      res
        .status(201)
        .json({ status: "SUCCESS", message: "Post successfully created" });
    } catch (err) {
      if (uploadedImageKeys.length > 0) {
        await Promise.all(
          uploadedImageKeys.map(
            (key) =>
              new DeleteObjectCommand({
                Bucket: process.env["AWS_BUCKET_NAME"],
                Key: key,
              }),
          ),
        );
        console.log(`Cleaned up ${uploadedImageKeys.length} orphaned images`);
      }
      next(err);
    }
  },
);

export default postRoutes;
