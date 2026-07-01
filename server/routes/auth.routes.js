import express from "express";
import { register, login, logout, getMe, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate, registerSchema, loginSchema, updateProfileSchema } from "../utils/validators.js";

const router = express.Router();

router.post("/register", upload.single("profilePicture"), validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.put("/update-profile", protectRoute, upload.single("profilePicture"), validate(updateProfileSchema), updateProfile);

export default router;
