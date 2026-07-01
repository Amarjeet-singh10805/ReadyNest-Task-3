import express from "express";
import {
  getUserById,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/search", searchUsers);
router.get("/followers/:id", getFollowers);
router.get("/following/:id", getFollowing);
router.post("/follow/:id", followUser);
router.post("/unfollow/:id", unfollowUser);
router.get("/:id", getUserById);

export default router;
