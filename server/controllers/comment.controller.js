import { prisma } from "../config/prisma.js";
import { createNotification } from "./notification.controller.js";
import { getIO } from "../socket/socket.js";

const userSelect = { id: true, username: true, profilePicture: true };

export const addComment = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const { text } = req.body;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await prisma.comment.create({
      data: { postId, userId: req.user.id, text },
      include: { user: { select: userSelect } },
    });

    await createNotification({
      senderId: req.user.id,
      receiverId: post.userId,
      type: "COMMENT",
      postId,
    });

    const io = getIO();
    if (io) io.emit("newComment", { postId, comment });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: "asc" },
    });
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id } });

    const io = getIO();
    if (io) io.emit("commentDeleted", { postId: comment.postId, commentId: id });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
