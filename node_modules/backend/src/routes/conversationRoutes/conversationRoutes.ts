import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import {
  ConversationCreateParamsData,
  ConversationGetParamsData,
  type ConversationCreateParams,
  type ConversationGetParams,
} from "./conversationSchema";
import conversationServices from "../../services/conversationServices/conversationServices";

const conversationRouter = express.Router();

conversationRouter.post(
  "/:receiverId/create",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: ConversationCreateParams =
        ConversationCreateParamsData.parse(req.params);

      const createdConversation =
        await conversationServices.createConversationService(
          validatedParams.receiverId,
          req.session.userId,
        );

      res.status(201).json({
        status: "SUCCESS",
        message: "Successfully created conversation group",
        createdConversation,
      });
    } catch (err) {
      next(err);
    }
  },
);

conversationRouter.get("/metadata", isAuthenticated, async (req, res, next) => {
  try {
    const fetchedConversationsMetadata =
      await conversationServices.getAllConversationsMetadataService(
        req.session.userId,
      );

    res.status(200).json({
      status: "SUCCESS",
      message: "Successfully fetched all conversations metadata",
      fetchedConversationsMetadata,
    });
  } catch (err) {
    next(err);
  }
});

conversationRouter.get(
  "/:conversationId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: ConversationGetParams =
        ConversationGetParamsData.parse(req.params);
      const fetchedConversationHistory =
        await conversationServices.getConversationHistoryService(
          validatedParams.conversationId,
          req.session.userId,
        );
      res.status(200).json({
        status: "SUCCESS",
        message: "Successfully fetched all message history",
        fetchedConversationHistory,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default conversationRouter;
