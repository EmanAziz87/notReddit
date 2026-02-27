import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import {
  CreateMessage,
  MessageParamsData,
  type CreateMessageData,
  type MessageParams,
} from "./messageSchema";
import messageService from "../../services/messageServices/messageService";

const messageRouter = express.Router();

messageRouter.post(
  "/:conversationId/create",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const validatedParams: MessageParams = MessageParamsData.parse(
        req.params,
      );

      const validatedData: CreateMessageData = CreateMessage.parse(req.body);

      const createdMessage = await messageService.createMessageService(
        validatedParams.conversationId,
        req.session.userId,
        validatedData.content,
      );

      res.status(201).json({
        status: "SUCCESS",
        message: "Successfully sent message",
        createdMessage,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default messageRouter;
