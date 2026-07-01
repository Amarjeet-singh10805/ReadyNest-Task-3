import { prisma } from "../config/prisma.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const userSelect = { id: true, username: true, profilePicture: true };

const withCounts = async (post, userId) => {
  const [likesCount, commentsCount, likedByMe, savedByMe] = await Promise.all([
    prisma.like.count({ where: { postId: post.id } }),
    prisma.comment.count({ where: { postId: post.id } }),
    prisma.like.findUnique({ where: { userId_postId: { userId, postId: post.id } } }),
    prisma.savedPost.findUnique({ where: { userId_postId: { userId, postId: post.id } } }),
  ]);
  return {
    ...post,
    likesCount,
    commentsCount,
    likedByMe: !!likedByMe,
    savedByMe: !!savedByMe,
  };
};

export const createPost = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "An image is required" });

    const result = await uploadToCloudinary(req.file.buffer, "instagram-clone/posts");

    const post = await prisma.post.create({
      data: {
        userId: req.user.id,
        imageUrl: result.secure_url,
        caption: req.body.caption || "",
      },
      include: { user: { select: userSelect } },
    });

    res.status(201).json(await withCounts(post, req.user.id));
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 30);

    const posts = await prisma.post.findMany({
      include: { user: { select: userSelect } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const postsWithCounts = await Promise.all(posts.map((p) => withCounts(p, req.user.id)));

    res.status(200).json({
      posts: postsWithCounts,
      hasMore: posts.length === limit,
      page,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({
      where: { id },
      include: { user: { select: userSelect } },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(await withCounts(post, req.user.id));
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const posts = await prisma.post.findMany({
      where: { userId },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: "desc" },
    });
    const postsWithCounts = await Promise.all(posts.map((p) => withCounts(p, req.user.id)));
    res.status(200).json(postsWithCounts);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: { caption: req.body.caption },
      include: { user: { select: userSelect } },
    });

    res.status(200).json(await withCounts(updated, req.user.id));
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await prisma.post.delete({ where: { id } });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};
