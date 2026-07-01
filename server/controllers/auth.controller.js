import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { generateToken, clearTokenCookie } from "../utils/generateToken.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.email === email
            ? "Email already in use"
            : "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePicture = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "instagram-clone/avatars");
      profilePicture = result.secure_url;
    }

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, profilePicture },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
      },
    });

    generateToken(user.id, res);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    const { password: _pw, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const postsCount = await prisma.post.count({ where: { userId: req.user.id } });
    const followersCount = await prisma.follow.count({ where: { followingId: req.user.id } });
    const followingCount = await prisma.follow.count({ where: { followerId: req.user.id } });

    res.status(200).json({ ...req.user, postsCount, followersCount, followingCount });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, bio } = req.body;
    const data = {};

    if (username) {
      const taken = await prisma.user.findFirst({
        where: { username, NOT: { id: req.user.id } },
      });
      if (taken) return res.status(409).json({ message: "Username already taken" });
      data.username = username;
    }

    if (bio !== undefined) data.bio = bio;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "instagram-clone/avatars");
      data.profilePicture = result.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
