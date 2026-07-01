import { prisma } from "../config/prisma.js";
import { createNotification } from "./notification.controller.js";
import { getIO } from "../socket/socket.js";

export const likePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    await prisma.like.create({ data: { userId, postId } });

    const likesCount = await prisma.like.count({ where: { postId } });

    await createNotification({ senderId: userId, receiverId: post.userId, type: "LIKE", postId });

    const io = getIO();
    if (io) io.emit("likeUpdate", { postId, likesCount });

    res.status(200).json({ likesCount, likedByMe: true });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Post already liked" });
    }
    next(error);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.id;

    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });

    const likesCount = await prisma.like.count({ where: { postId } });

    const io = getIO();
    if (io) io.emit("likeUpdate", { postId, likesCount });

    res.status(200).json({ likesCount, likedByMe: false });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Like not found" });
    }
    next(error);
  }
};
