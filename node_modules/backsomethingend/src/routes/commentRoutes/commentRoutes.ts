import express from "express";
import {
  CommentParamsData,
  CreateCommentData,
  type CommentParams,
  type CreateCommentInput,
} from "./commentSchema";
import commentServices from "../../services/commentServices/commentServices";
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
        req.session.userId,
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
  "/post/:postId/:commentId/reply",
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
        validatedParams.commentId!,
        validatedData,
        req.session.userId,
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

commentRouter.put(
  "/post/:postId/:commentId/edit",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: CommentParams = CommentParamsData.parse(
        req.params,
      );
      const validatedData: CreateCommentInput = CreateCommentData.parse(
        req.body,
      );

      const editedComment = await commentServices.editCommentService(
        validatedParams.postId,
        validatedParams.commentId!,
        validatedData,
        req.session.userId,
      );
      res.status(201).json({
        status: "SUCCESS",
        message: "successfully edited comment",
        editedComment,
      });
    } catch (err) {
      next(err);
    }
  },
);

commentRouter.delete(
  "/post/:postId/:commentId/delete",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: CommentParams = CommentParamsData.parse(
        req.params,
      );
      await commentServices.deleteCommentService(
        validatedParams.postId,
        validatedParams.commentId!,
        req.session.userId,
      );
      res
        .status(204)
        .json({ status: "SUCCESS", message: "Successfully deleted comment" });
    } catch (err) {
      next(err);
    }
  },
);

commentRouter.put(
  "/post/:postId/:commentId/like",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: CommentParams = CommentParamsData.parse(
        req.params,
      );

      const likedComment = await commentServices.likeCommentService(
        validatedParams.postId,
        validatedParams.commentId!,
        req.session.userId,
      );

      res.status(201).json({
        status: "SUCCESS",
        message: "Successfully liked comment",
        likedComment,
      });
    } catch (err) {
      next(err);
    }
  },
);

commentRouter.put(
  "/post/:postId/:commentId/dislike",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: CommentParams = CommentParamsData.parse(
        req.params,
      );

      const dislikedComment = await commentServices.dislikedCommentService(
        validatedParams.postId,
        validatedParams.commentId!,
        req.session.userId,
      );

      res.status(201).json({
        status: "SUCCESS",
        message: "Successfully disliked comment",
        dislikedComment,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default commentRouter;
