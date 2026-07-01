import express from "express";
import {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  getUserPosts,
} from "../controllers/post.controller.js";
import { likePost, unlikePost } from "../controllers/like.controller.js";
import { addComment, getComments } from "../controllers/comment.controller.js";
import { savePost, unsavePost, getSavedPosts } from "../controllers/savedPost.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate, postSchema, commentSchema } from "../utils/validators.js";

const router = express.Router();

router.use(protectRoute);

router.post("/create", upload.single("image"), validate(postSchema), createPost);
router.get("/feed", getFeed);
router.get("/saved", getSavedPosts);
router.get("/user/:userId", getUserPosts);

router.get("/:id", getPostById);
router.put("/:id", validate(postSchema), updatePost);
router.delete("/:id", deletePost);

router.post("/:id/like", likePost);
router.post("/:id/unlike", unlikePost);

router.post("/:id/comment", validate(commentSchema), addComment);
router.get("/:id/comments", getComments);

router.post("/:id/save", savePost);
router.post("/:id/unsave", unsavePost);

export default router;
