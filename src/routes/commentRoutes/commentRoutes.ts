import express from "express";
import {
  CommentParamsData,
  CreateCommentData,
  type CommentParams,
  type CreateCommentInput,
} from "./commentSchema";
import commentServices from "../../services/cmmentServices/commentServices";
import { isAuthenticated } from "../../middleware/isAuthenticated";

const commentRouter = express.Router();

commentRouter.post(
  "/post/:postId/create",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: CommentParams = CommentParamsData.parse(
        req.params,
      );

      const validatedData: CreateCommentInput = CreateCommentData.parse(
        req.body,
      );

      const createdComment = await commentServices.createCommentService(
        validatedData,
        validatedParams.postId,
        Number(req.session.userId!),
      );

      res.status(201).json({
        status: "SUCCESSFULL",
        message: "Successfully created comment",
        createdComment,
      });
    } catch (err) {
      next(err);
    }
  },
);

commentRouter.post(
  "/post/:postId/:parentId/reply",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: CommentParams = CommentParamsData.parse(
        req.params,
      );
      const validatedData: CreateCommentInput = CreateCommentData.parse(
        req.body,
      );

      const createdReply = await commentServices.replyCommentService(
        validatedParams.postId,
        validatedParams.parentId!,
        validatedData,
        Number(req.session.userId),
      );

      res.status(201).json({
        status: "SUCCESS",
        message: "Successfully created reply comment",
        createdReply,
      });
    } catch (err) {
      next(err);
    }
  },
);

commentRouter.get("/post/:postId", async (req, res, next) => {
  try {
    const validatedParams: CommentParams = CommentParamsData.parse(req.params);

    const nestedComments = await commentServices.getAllCommentsForPostService(
      validatedParams.postId,
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Successfully fetched all comments for post",
      nestedComments,
    });
  } catch (err) {
    next(err);
  }
});

export default commentRouter;
