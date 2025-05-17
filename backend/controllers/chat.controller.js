import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  console.log("[getChats] Request headers:", req.headers);
  console.log("[getChats] tokenUserId:", tokenUserId);

  try {
    console.log("[getChats] Fetching user from DB...");
    if (!tokenUserId) {
      console.error("[getChats] No user ID provided in request");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUserId }
    });

    if (!user) {
      console.error("[getChats] User not found:", tokenUserId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[getChats] User verified, fetching chats...");

    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });

    console.log(`[getChats] Found ${chats.length} chats for user ${tokenUserId}`);

    // Process each chat to add receiver information
    const processedChats = await Promise.all(chats.map(async (chat) => {
      try {
        const receiverId = chat.userIDs.find((id) => id !== tokenUserId);
        if (!receiverId) {
          console.warn("[getChats] No receiver found for chat:", chat.id);
          return null;
        }

        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
          select: { id: true, username: true, avatar: true },
        });

        if (!receiver) {
          console.warn("[getChats] Receiver not found for ID:", receiverId);
          return null;
        }

        const unreadCount = chat.messages.filter(m => 
          !chat.seenBy.includes(tokenUserId) && m.userId !== tokenUserId
        ).length;

        return {
          ...chat,
          receiver,
          unreadCount,
          lastMessage: chat.messages[0]?.text || null
        };
      } catch (err) {
        console.error(`[getChats] Error processing chat ${chat.id}:`, err);
        return null;
      }
    }));

    // Filter out any null values from failed processing
    const validChats = processedChats.filter(chat => chat !== null);

    console.log(`[getChats] Successfully processed ${validChats.length} chats`);
    res.status(200).json(validChats);
  } catch (err) {
    console.error("[getChats] Error in getChats:", err);
    res.status(500).json({ 
      message: "Failed to get chats!", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { id: chatId },
          { userIDs: { has: tokenUserId } }
        ]
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }

    const receiverId = chat.userIDs.find((id) => id !== tokenUserId);
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, username: true, avatar: true },
    });

    chat.receiver = receiver;
    chat.messages = chat.messages.reverse();

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chat:", err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required!" });
  }

  try {
    // Check if chat already exists between these users
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          { userIDs: { has: tokenUserId } },
          { userIDs: { has: receiverId } }
        ]
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });

    if (existingChat) {
      // Add receiver info to the existing chat
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, username: true, avatar: true }
      });
      existingChat.receiver = receiver;
      return res.status(200).json(existingChat);
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiverId],
        seenBy: [tokenUserId],
        lastMessage: null
      },
      include: {
        messages: true
      }
    });

    // Add receiver info to the new chat
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, username: true, avatar: true }
    });
    newChat.receiver = receiver;

    res.status(201).json(newChat);
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ message: "Failed to create chat!" });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        seenBy: {
          push: tokenUserId,
        },
      },
    });

    res.status(200).json(updatedChat);
  } catch (err) {
    console.error("Error updating chat:", err);
    res.status(500).json({ message: "Failed to update chat!" });
  }
};