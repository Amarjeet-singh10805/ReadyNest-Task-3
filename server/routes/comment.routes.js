import express from "express";
import { deleteComment } from "../controllers/comment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.delete("/:id", protectRoute, deleteComment);

export default router;
