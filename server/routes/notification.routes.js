import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getNotifications);
router.put("/read/:id", markNotificationRead);
router.put("/read-all", markAllNotificationsRead);

export default router;
