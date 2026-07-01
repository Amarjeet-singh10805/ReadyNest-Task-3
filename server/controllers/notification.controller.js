import { prisma } from "../config/prisma.js";
import { getIO, onlineUsers } from "../socket/socket.js";

export const createNotification = async ({ senderId, receiverId, type, postId = null }) => {
  if (senderId === receiverId) return null;

  const notification = await prisma.notification.create({
    data: { senderId, receiverId, type, postId },
    include: {
      sender: { select: { id: true, username: true, profilePicture: true } },
    },
  });

  const unreadCount = await prisma.notification.count({
    where: { receiverId, isRead: false },
  });

  const io = getIO();
  const socketId = onlineUsers.get(receiverId);
  if (io && socketId) {
    io.to(socketId).emit("newNotification", { notification, unreadCount });
  }

  return notification;
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { receiverId: req.user.id },
      include: {
        sender: { select: { id: true, username: true, profilePicture: true } },
        post: { select: { id: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await prisma.notification.updateMany({
      where: { id, receiverId: req.user.id },
      data: { isRead: true },
    });

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { receiverId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
