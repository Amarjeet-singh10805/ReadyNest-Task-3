import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protectRoute);

router.get("/", getMyConversations);
router.post("/with/:userId", getOrCreateConversation);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);

export default router;
