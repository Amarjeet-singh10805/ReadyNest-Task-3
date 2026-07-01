import { prisma } from "../config/prisma.js";

const userSelect = { id: true, username: true, profilePicture: true };

export const savePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    await prisma.savedPost.create({ data: { userId, postId } });
    res.status(200).json({ message: "Post saved", savedByMe: true });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Post already saved" });
    }
    next(error);
  }
};

export const unsavePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.id;

    await prisma.savedPost.delete({
      where: { userId_postId: { userId, postId } },
    });
    res.status(200).json({ message: "Post unsaved", savedByMe: false });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Saved post not found" });
    }
    next(error);
  }
};

export const getSavedPosts = async (req, res, next) => {
  try {
    const saved = await prisma.savedPost.findMany({
      where: { userId: req.user.id },
      include: {
        post: { include: { user: { select: userSelect } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const posts = await Promise.all(
      saved.map(async (s) => {
        const likesCount = await prisma.like.count({ where: { postId: s.post.id } });
        const commentsCount = await prisma.comment.count({ where: { postId: s.post.id } });
        const likedByMe = await prisma.like.findUnique({
          where: { userId_postId: { userId: req.user.id, postId: s.post.id } },
        });
        return { ...s.post, likesCount, commentsCount, likedByMe: !!likedByMe, savedByMe: true };
      })
    );

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
