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

export default conversationRouter;
