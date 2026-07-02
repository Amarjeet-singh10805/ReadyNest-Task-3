import { prisma } from "../config/prisma.js";
import { getIO } from "../socket/socket.js";

const userSelect = { id: true, username: true, profilePicture: true };

// Get or create a 1:1 conversation between two users
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const myId = req.user.id;
    const otherId = Number(req.params.userId);
    if (myId === otherId) return res.status(400).json({ message: "Cannot DM yourself" });

    // Find existing conversation between exactly these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        participants: { every: { userId: { in: [myId, otherId] } } },
        AND: [
          { participants: { some: { userId: myId } } },
          { participants: { some: { userId: otherId } } },
        ],
      },
      include: {
        participants: { include: { user: { select: userSelect } } },
      },
    });

    if (existing) return res.json(existing);

    const convo = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: myId }, { userId: otherId }],
        },
      },
      include: {
        participants: { include: { user: { select: userSelect } } },
      },
    });

    res.status(201).json(convo);
  } catch (err) {
    next(err);
  }
};

// List all conversations for the current user
export const getMyConversations = async (req, res, next) => {
  try {
    const myId = req.user.id;
    const convos = await prisma.conversation.findMany({
      where: { participants: { some: { userId: myId } } },
      include: {
        participants: { include: { user: { select: userSelect } } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: userSelect }, post: { include: { user: { select: userSelect } } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(convos);
  } catch (err) {
    next(err);
  }
};

// Get messages for a conversation
export const getMessages = async (req, res, next) => {
  try {
    const myId = req.user.id;
    const convoId = Number(req.params.id);

    // Verify user is a participant
    const member = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: convoId, userId: myId } },
    });
    if (!member) return res.status(403).json({ message: "Not a participant" });

    const messages = await prisma.message.findMany({
      where: { conversationId: convoId },
      include: {
        sender: { select: userSelect },
        post: { include: { user: { select: userSelect } } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// Send a message (text and/or post share)
// REPLACE WITH:
export const sendMessage = async (req, res, next) => {
  try {
    const myId = req.user.id;
    const convoId = Number(req.params.id);
    const { text, postId } = req.body;

    if (!text && !postId) return res.status(400).json({ message: "Message cannot be empty" });

    const member = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: convoId, userId: myId } },
    });
    if (!member) return res.status(403).json({ message: "Not a participant" });

    // create message and update conversation separately so includes work correctly
    const message = await prisma.message.create({
      data: {
        conversationId: convoId,
        senderId: myId,
        text: text || null,
        postId: postId ? Number(postId) : null,
      },
      include: {
        sender: { select: userSelect },
        post: { include: { user: { select: userSelect } } },
      },
    });

    await prisma.conversation.update({
      where: { id: convoId },
      data: { updatedAt: new Date() },
    });

    getIO().to(`convo:${convoId}`).emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};
