import { prisma } from "../config/prisma.js";
import { createNotification } from "./notification.controller.js";
import { getIO, onlineUsers } from "../socket/socket.js";

const userSelect = {
  id: true,
  username: true,
  profilePicture: true,
  bio: true,
  createdAt: true,
};

export const getUserById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) return res.status(404).json({ message: "User not found" });

    const [postsCount, followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.post.count({ where: { userId: id } }),
      prisma.follow.count({ where: { followingId: id } }),
      prisma.follow.count({ where: { followerId: id } }),
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: id } },
      }),
    ]);

    res.status(200).json({
      ...user,
      postsCount,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const users = await prisma.user.findMany({
      where: { username: { contains: q } },
      select: userSelect,
      take: 20,
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const followingId = Number(req.params.id);
    const followerId = req.user.id;

    if (followingId === followerId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    await prisma.follow.create({ data: { followerId, followingId } });

    await createNotification({
      senderId: followerId,
      receiverId: followingId,
      type: "FOLLOW",
    });

    const io = getIO();
    const socketId = onlineUsers.get(followingId);
    if (io && socketId) {
      const followersCount = await prisma.follow.count({ where: { followingId } });
      io.to(socketId).emit("followerCountUpdate", { userId: followingId, followersCount });
    }

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Already following this user" });
    }
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const followingId = Number(req.params.id);
    const followerId = req.user.id;

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });

    const followersCount = await prisma.follow.count({ where: { followingId } });
    const io = getIO();
    const socketId = onlineUsers.get(followingId);
    if (io && socketId) {
      io.to(socketId).emit("followerCountUpdate", { userId: followingId, followersCount });
    }

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "You were not following this user" });
    }
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const followers = await prisma.follow.findMany({
      where: { followingId: id },
      include: { follower: { select: userSelect } },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(followers.map((f) => f.follower));
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const following = await prisma.follow.findMany({
      where: { followerId: id },
      include: { following: { select: userSelect } },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(following.map((f) => f.following));
  } catch (error) {
    next(error);
  }
};
